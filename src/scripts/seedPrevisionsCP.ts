import { supabase } from "../integrations/supabase/client";
import { mockOperations, mockEngagements, mockPrevisionsCP } from "../mocks/previsionsCP";
import { v4 as uuidv4 } from "uuid";

async function seedPrevisionsCP() {
  try {
    const portfolioId = uuidv4();
    const userId = uuidv4();
    const roleId = uuidv4();
    const timestamp = new Date().getTime();

    // Create a role first (required for users)
    console.log("Creating role...");
    const { error: roleError } = await supabase.from("roles").insert({
      id: roleId,
      name: `Test Role ${timestamp}`,
      description: "Role for testing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (roleError) {
      throw new Error(`Error creating role: ${roleError.message}`);
    }
    console.log("Role created successfully");

    // Create a user
    console.log("Creating user...");
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password_hash: "dummy_hash",
      role_id: roleId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      throw new Error(`Error creating user: ${userError.message}`);
    }
    console.log("User created successfully");

    // Create a portfolio first (required for programs)
    console.log("Creating portfolio...");
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .insert({
        id: portfolioId,
        name: `Portfolio Test ${timestamp}`,
        description: "Portfolio for testing",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (portfolioError) {
      throw new Error(`Error creating portfolio: ${portfolioError.message}`);
    }
    console.log("Portfolio created successfully");

    // Create a program
    console.log("Creating program...");
    const { error: programError } = await supabase.from("programs").insert({
      id: mockOperations[0].program_id,
      name: `Programme Test ${timestamp}`,
      description: "Programme pour les tests",
      portfolio_id: portfolioId,
      created_at: new Date().toISOString(),
    });

    if (programError) {
      throw new Error(`Error creating program: ${programError.message}`);
    }
    console.log("Program created successfully");

    // Insert operations
    console.log("Inserting operations...");
    const { error: operationsError } = await supabase.from("operations").insert(mockOperations);

    if (operationsError) {
      throw new Error(`Error inserting operations: ${operationsError.message}`);
    }
    console.log("Operations inserted successfully");

    // Update engagements with the real user ID
    const engagementsWithUser = mockEngagements.map((engagement) => ({
      ...engagement,
      requested_by: userId,
    }));

    // Insert engagements
    console.log("Inserting engagements...");
    const { error: engagementsError } = await supabase.from("engagements").insert(engagementsWithUser);

    if (engagementsError) {
      throw new Error(`Error inserting engagements: ${engagementsError.message}`);
    }
    console.log("Engagements inserted successfully");

    // Insert previsions
    console.log("Inserting previsions...");
    console.log("Previsions data:", JSON.stringify(mockPrevisionsCP, null, 2));
    const { error: previsionsError } = await supabase.from("prevision_cp").insert(mockPrevisionsCP);

    if (previsionsError) {
      console.error("Previsions error details:", previsionsError);
      throw new Error(`Error inserting previsions: ${previsionsError.message}`);
    }
    console.log("Previsions inserted successfully");

    console.log("All data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

// Run the seeding function
seedPrevisionsCP();
