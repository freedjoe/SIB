import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabase";
import path from "path";

async function importExcelData() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, "../../docs/loi_de_finance_2025_FR_tables.xlsx"));

    // Import ministries
    const ministriesSheet = workbook.getWorksheet(1);
    const ministriesData = ministriesSheet.getSheetValues();

    // Skip header row and convert to objects
    for (let i = 2; i < ministriesData.length; i++) {
      const row = ministriesData[i];
      const ministry = {
        name: row[1], // Assuming Ministry Name is in column A
        code: row[2] || null, // Assuming Code is in column B
      };

      const { data, error } = await supabase.from("ministries").upsert(ministry, { onConflict: "code" }).select().single();

      if (error) {
        console.error("Error importing ministry:", error);
        continue;
      }
      console.log("Imported ministry:", data.name);
    }

    // Import categories
    const categoriesSheet = workbook.getWorksheet(2);
    const categoriesData = categoriesSheet.getSheetValues();

    // Skip header row and convert to objects
    for (let i = 2; i < categoriesData.length; i++) {
      const row = categoriesData[i];
      const category = {
        name: row[1], // Assuming Category Name is in column A
        code: row[2] || null, // Assuming Code is in column B
        parent_id: row[3] ? await getCategoryIdByCode(row[3].toString()) : null, // Assuming Parent Code is in column C
      };

      const { data, error } = await supabase.from("budget_titles").upsert(category, { onConflict: "code" }).select().single();

      if (error) {
        console.error("Error importing category:", error);
        continue;
      }
      console.log("Imported category:", data.name);
    }

    // Import allocations
    const allocationsSheet = workbook.getWorksheet(3);
    const allocationsData = allocationsSheet.getSheetValues();

    // Skip header row and convert to objects
    for (let i = 2; i < allocationsData.length; i++) {
      const row = allocationsData[i];
      const ministryId = await getMinistryIdByCode(row[1].toString()); // Assuming Ministry Code is in column A
      const categoryId = await getCategoryIdByCode(row[2].toString()); // Assuming Category Code is in column B

      if (!ministryId || !categoryId) {
        console.error("Missing ministry or category for allocation:", row);
        continue;
      }

      const allocation = {
        ministry_id: ministryId,
        category_id: categoryId,
        fiscal_year: 2025,
        initial_amount: row[3], // Assuming Initial Amount is in column C
        revised_amount: row[4] || null, // Assuming Revised Amount is in column D
        actual_amount: row[5] || null, // Assuming Actual Amount is in column E
        status: row[6] || "DRAFT", // Assuming Status is in column F
      };

      const { error } = await supabase.from("budget_allocations").upsert(allocation);

      if (error) {
        console.error("Error importing allocation:", error);
        continue;
      }
      console.log("Imported allocation for ministry:", ministryId, "category:", categoryId);
    }

    console.log("Import completed successfully");
  } catch (error) {
    console.error("Error during import:", error);
  }
}

async function getMinistryIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase.from("ministries").select("id").eq("code", code).single();

  if (error || !data) {
    console.error("Error finding ministry by code:", code, error);
    return null;
  }

  return data.id;
}

async function getCategoryIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase.from("budget_titles").select("id").eq("code", code).single();

  if (error || !data) {
    console.error("Error finding category by code:", code, error);
    return null;
  }

  return data.id;
}

// Run the import
importExcelData();
