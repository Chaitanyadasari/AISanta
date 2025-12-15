const { getContainer } = require('./cosmosdb');

// Get all assignments
async function getAllAssignments() {
  try {
    const container = await getContainer('assignments');
    const { resources: assignments } = await container.items.readAll().fetchAll();
    return { assignments };
  } catch (error) {
    console.error('Error getting assignments:', error);
    throw error;
  }
}

// Get assignment by santa (who is giving)
async function getAssignmentBySanta(santa) {
  try {
    const container = await getContainer('assignments');
    const querySpec = {
      query: 'SELECT * FROM assignments a WHERE a.santa = @santa',
      parameters: [{ name: '@santa', value: santa }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  } catch (error) {
    console.error('Error getting assignment by santa:', error);
    throw error;
  }
}

// Save all assignments (bulk operation)
async function saveAssignments(assignmentsArray) {
  try {
    const container = await getContainer('assignments');
    
    // Clear existing assignments
    const { resources: existing } = await container.items.readAll().fetchAll();
    for (const item of existing) {
      await container.item(item.id, item.santa).delete();
    }
    
    // Insert new assignments
    if (assignmentsArray && assignmentsArray.length > 0) {
      for (const assignment of assignmentsArray) {
        await container.items.create({
          id: assignment.santa, // Use santa as unique ID
          ...assignment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return { assignments: assignmentsArray };
  } catch (error) {
    console.error('Error saving assignments:', error);
    throw error;
  }
}

// Clear all assignments
async function clearAssignments() {
  try {
    const container = await getContainer('assignments');
    const { resources: assignments } = await container.items.readAll().fetchAll();
    
    for (const assignment of assignments) {
      await container.item(assignment.id, assignment.santa).delete();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing assignments:', error);
    throw error;
  }
}

// Check if assignments exist
async function assignmentsExist() {
  try {
    const container = await getContainer('assignments');
    const querySpec = {
      query: 'SELECT VALUE COUNT(1) FROM assignments'
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] > 0;
  } catch (error) {
    console.error('Error checking assignments:', error);
    throw error;
  }
}

module.exports = {
  getAllAssignments,
  getAssignmentBySanta,
  saveAssignments,
  clearAssignments,
  assignmentsExist,
};