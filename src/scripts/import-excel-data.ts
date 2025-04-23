import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import path from "path";

async function importExcelData() {
  try {
    // Read ministries data
    const ministriesWorkbook = XLSX.readFile(path.join(__dirname, "../../docs/loi_de_finance_2025_FR_tables.xlsx"));
    const ministriesSheet = ministriesWorkbook.Sheets[ministriesWorkbook.SheetNames[0]];
    const ministriesData = XLSX.utils.sheet_to_json(ministriesSheet);

    // Import ministries
    for (const row of ministriesData) {
      const ministry = {
        name: row["Ministry Name"],
        code: row["Code"] || null,
      };

      const { data, error } = await supabase.from("ministries").upsert(ministry, { onConflict: "code" }).select().single();

      if (error) {
        console.error("Error importing ministry:", error);
        continue;
      }
      console.log("Imported ministry:", data.name);
    }

    // Read budget categories data
    const categoriesWorkbook = XLSX.readFile(path.join(__dirname, "../../docs/loi_de_finance_2025_FR_tables.xlsx"));
    const categoriesSheet = categoriesWorkbook.Sheets[categoriesWorkbook.SheetNames[1]];
    const categoriesData = XLSX.utils.sheet_to_json(categoriesSheet);

    // Import categories
    for (const row of categoriesData) {
      const category = {
        name: row["Category Name"],
        code: row["Code"] || null,
        parent_id: row["Parent Code"] ? await getCategoryIdByCode(row["Parent Code"]) : null,
      };

      const { data, error } = await supabase.from("budget_categories").upsert(category, { onConflict: "code" }).select().single();

      if (error) {
        console.error("Error importing category:", error);
        continue;
      }
      console.log("Imported category:", data.name);
    }

    // Read budget allocations data
    const allocationsWorkbook = XLSX.readFile(path.join(__dirname, "../../docs/loi_de_finance_2025_FR_tables.xlsx"));
    const allocationsSheet = allocationsWorkbook.Sheets[allocationsWorkbook.SheetNames[2]];
    const allocationsData = XLSX.utils.sheet_to_json(allocationsSheet);

    // Import allocations
    for (const row of allocationsData) {
      const ministryId = await getMinistryIdByCode(row["Ministry Code"]);
      const categoryId = await getCategoryIdByCode(row["Category Code"]);

      if (!ministryId || !categoryId) {
        console.error("Missing ministry or category for allocation:", row);
        continue;
      }

      const allocation = {
        ministry_id: ministryId,
        category_id: categoryId,
        fiscal_year: 2025,
        initial_amount: row["Initial Amount"],
        revised_amount: row["Revised Amount"] || null,
        actual_amount: row["Actual Amount"] || null,
        status: row["Status"] || "DRAFT",
      };

      const { data, error } = await supabase.from("budget_allocations").upsert(allocation).select().single();

      if (error) {
        console.error("Error importing allocation:", error);
        continue;
      }
      console.log("Imported allocation for ministry:", row["Ministry Code"]);
    }

    console.log("Data import completed successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  }
}

async function getMinistryIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase.from("ministries").select("id").eq("code", code).single();

  if (error || !data) {
    console.error("Error finding ministry by code:", code);
    return null;
  }

  return data.id;
}

async function getCategoryIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase.from("budget_categories").select("id").eq("code", code).single();

  if (error || !data) {
    console.error("Error finding category by code:", code);
    return null;
  }

  return data.id;
}

// Run the import
importExcelData();
