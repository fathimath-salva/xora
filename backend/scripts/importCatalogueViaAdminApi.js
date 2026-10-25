import readline from 'node:readline';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { pathToFileURL } from 'node:url';
import { categoriesData, productsData } from '../src/utils/seedData.js';
import { buildCategoryImportPlan, buildImportPlan } from '../src/utils/catalogueImporter.js';

const API_BASE_URL = 'https://xora-backend-u7fd.onrender.com/api';

const parseArgs = (argv) => {
  if (argv.length === 0) return { apply: false };
  if (argv.length === 1 && argv[0] === '--apply') return { apply: true };
  throw new Error('Unknown arguments. Omit arguments for a dry run or use --apply after approval.');
};

const prompt = (question) => new Promise((resolve) => {
  const interfaceInstance = readline.createInterface({ input, output });
  interfaceInstance.question(question, (answer) => {
    interfaceInstance.close();
    resolve(answer.trim());
  });
});

const promptPassword = (question) => new Promise((resolve, reject) => {
  if (!input.isTTY) {
    reject(new Error('An interactive terminal is required so the password is never passed as an argument or environment variable.'));
    return;
  }
  let password = '';
  output.write(question);
  input.setRawMode(true);
  input.resume();
  input.setEncoding('utf8');
  const onData = (chunk) => {
    if (chunk === '\r' || chunk === '\n') {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      output.write('\n');
      resolve(password);
      return;
    }
    if (chunk === '\u0003') {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      reject(new Error('Authentication cancelled.'));
      return;
    }
    if (chunk === '\u007f' || chunk === '\b') {
      password = password.slice(0, -1);
      return;
    }
    password += chunk;
  };
  input.on('data', onData);
});

const request = async (path, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(`The deployed YAQANA API rejected ${method} ${path} (HTTP ${response.status}).`);
  }
  return data;
};

const listProducts = async (token) => {
  const firstPage = await request('/products?limit=100&page=1', { token });
  const products = [...(firstPage.products || [])];
  for (let page = 2; page <= (firstPage.totalPages || 0); page += 1) {
    const response = await request(`/products?limit=100&page=${page}`, { token });
    products.push(...(response.products || []));
  }
  return products;
};

export const toProductApiPayload = (product) => {
  const { collectionName, priceInr, discountPriceInr, ...document } = product;
  return {
    ...document,
    collection: collectionName || '',
    price: priceInr / 83,
    discountPrice: discountPriceInr === null ? null : discountPriceInr / 83
  };
};

export const createDryRunReport = ({ existingCategories, existingProducts }) => {
  const categoryPlan = buildCategoryImportPlan(categoriesData, existingCategories);
  const productPlan = buildImportPlan(productsData, existingProducts);
  return {
    mode: 'dry-run',
    apiDestination: API_BASE_URL,
    requiredCategories: categoriesData.map(({ name, slug }) => ({ name, slug })),
    existingCategories: categoryPlan.alreadyPresent.map(({ name, slug }) => ({ name, slug })),
    categoriesToCreate: categoryPlan.insertCandidates.map(({ document }) => ({ name: document.name, slug: document.slug })),
    expectedProducts: productsData.length,
    existingMatchingProducts: productPlan.alreadyPresent.map(({ name, gender }) => ({ name, gender })),
    productsToCreate: productPlan.insertCandidates.map(({ document }) => ({ name: document.name, category: document.category, gender: document.gender })),
    validationErrors: []
  };
};

const authenticate = async () => {
  const email = await prompt('Admin email: ');
  const password = await promptPassword('Admin password: ');
  const response = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  if (response.user?.role !== 'admin' || typeof response.token !== 'string') {
    throw new Error('The supplied account is not authorized for YAQANA catalogue administration.');
  }
  return response.token;
};

const confirmApply = async () => (await prompt('Type APPLY to create only the items in this reviewed plan: ')) === 'APPLY';

const run = async () => {
  const { apply } = parseArgs(process.argv.slice(2));
  const token = await authenticate();
  const [categoryResponse, existingProducts] = await Promise.all([
    request('/categories', { token }),
    listProducts(token)
  ]);
  const existingCategories = categoryResponse.categories || [];
  const report = createDryRunReport({ existingCategories, existingProducts });
  console.log(JSON.stringify(report, null, 2));

  if (!apply) return;
  if (!(await confirmApply())) {
    console.log('No changes were made.');
    return;
  }

  for (const category of report.categoriesToCreate) {
    const sourceCategory = categoriesData.find(({ slug }) => slug === category.slug);
    await request('/categories', { method: 'POST', token, body: sourceCategory });
  }
  const productPlan = buildImportPlan(productsData, existingProducts);
  for (const candidate of productPlan.insertCandidates) {
    const sourceProduct = productsData.find((product) => product.name === candidate.document.name && product.gender === candidate.document.gender);
    await request('/products', { method: 'POST', token, body: toProductApiPayload(sourceProduct) });
  }
  console.log('Catalogue import completed. Re-run without --apply to verify the final state.');
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
