const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const categoryService = require('./src/services/category.service');

async function runTests() {
  console.log('--- Testing Category Parent-Child Hierarchy ---');
  
  try {
    // 1. Create Parent
    const parent = await categoryService.create({
      name: 'Electronics',
      type: 'PRODUCT',
      description: 'All electronic items'
    });
    console.log('✅ Created Parent:', parent.name);

    // 2. Create Child
    const child = await categoryService.create({
      name: 'Mobile Phones',
      type: 'PRODUCT',
      parentId: parent.id,
      description: 'Smartphones and cellphones'
    });
    console.log('✅ Created Child:', child.name, 'with parent ID', child.parentId);
    
    // 3. Create Grandchild
    const grandchild = await categoryService.create({
      name: 'Smartphones',
      type: 'PRODUCT',
      parentId: child.id
    });
    console.log('✅ Created Grandchild:', grandchild.name, 'with parent ID', grandchild.parentId);

    // 4. Fetch Tree
    const tree = await categoryService.getTree('PRODUCT');
    console.log('\n--- Full Category Tree ---');
    console.log(JSON.stringify(tree, null, 2));

    // 5. Cleanup
    await prisma.category.deleteMany({
      where: {
        id: { in: [parent.id, child.id, grandchild.id] }
      }
    });
    console.log('\n✅ Cleanup completed.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
