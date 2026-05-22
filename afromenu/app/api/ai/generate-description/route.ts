import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Only instantiate OpenAI if an API key is provided
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Premium fallback catalog for typical Somali / Middle Eastern / Global menu options
const fallbackDescriptions: Record<string, string> = {
  "sambusa": "Crispy golden pastry triangles filled with spiced minced meat, toasted cumin, and fresh cilantro. Served hot with a tangy lime dipping sauce.\n\n🔥 Macros: ~280 kcal | Protein: 12g | Carbs: 22g | Fat: 14g\n⚠️ Allergens: Gluten (wheat pastry)",
  "camel sambusa": "Crispy golden pastry triangles filled with spiced minced camel meat, toasted cumin, and fresh cilantro. Served hot with a tangy lime dipping sauce.\n\n🔥 Macros: ~290 kcal | Protein: 13g | Carbs: 22g | Fat: 14g\n⚠️ Allergens: Gluten (wheat pastry)",
  "somali tea": "Authentic spiced tea brewed with rich black tea leaves, creamy milk, cardamom, cloves, ginger, and a dash of cinnamon for a warming, aromatic finish.\n\n🔥 Macros: ~95 kcal | Protein: 3g | Carbs: 12g | Fat: 3g\n⚠️ Allergens: Dairy (milk)",
  "bariis": "Fragrant, long-grain basmati rice cooked to perfection with traditional Somali spices, saffron, cloves, and caramelized onions.\n\n🔥 Macros: ~420 kcal | Protein: 8g | Carbs: 65g | Fat: 12g\n⚠️ Allergens: None",
  "bariis single": "Fragrant, long-grain basmati rice cooked to perfection with traditional Somali spices, saffron, cloves, and caramelized onions.\n\n🔥 Macros: ~420 kcal | Protein: 8g | Carbs: 65g | Fat: 12g\n⚠️ Allergens: None",
  "bariis iyo hilib": "Traditional Somali rice served alongside tender, succulent slow-cooked goat meat infused with garlic, cumin, and coriander.\n\n🔥 Macros: ~680 kcal | Protein: 42g | Carbs: 68g | Fat: 22g\n⚠️ Allergens: None",
  "suqaar": "Tender cubes of beef or chicken pan-seared with bell peppers, onions, carrots, and seasoned with house xawaash spices.\n\n🔥 Macros: ~380 kcal | Protein: 34g | Carbs: 8g | Fat: 18g\n⚠️ Allergens: None",
  "mango lassi": "Creamy and refreshing yogurt-based drink blended with sweet ripe mango pulp and a touch of cardamom.\n\n🔥 Macros: ~180 kcal | Protein: 5g | Carbs: 28g | Fat: 4g\n⚠️ Allergens: Dairy",
  "shawarma": "Succulent, thinly shaved marinated chicken or beef wrapped in warm flatbread with pickles, garlic paste, and fresh vegetables.\n\n🔥 Macros: ~450 kcal | Protein: 28g | Carbs: 35g | Fat: 18g\n⚠️ Allergens: Gluten, Sesame (Tahini)",
  "hilib ari": "Slow-roasted, ultra-tender Somali goat meat seasoned with exotic xawaash spices, garlic, and cooked to fall-off-the-bone perfection.\n\n🔥 Macros: ~520 kcal | Protein: 45g | Carbs: 0g | Fat: 32g\n⚠️ Allergens: None",
  "malawah": "Sweet, thin Somali crêpe fried to golden perfection, lightly drizzled with honey or melted ghee, perfect with tea.\n\n🔥 Macros: ~220 kcal | Protein: 4g | Carbs: 32g | Fat: 8g\n⚠️ Allergens: Gluten, Dairy, Eggs",
  "canjeero": "Soft, spongy fermented sourdough flatbread prepared fresh daily, traditionally drizzled with sesame oil and sugar.\n\n🔥 Macros: ~150 kcal | Protein: 4g | Carbs: 28g | Fat: 2g\n⚠️ Allergens: Gluten"
};

export async function POST(req: Request) {
  try {
    const { itemName } = await req.json();

    if (!itemName || typeof itemName !== "string" || !itemName.trim()) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const query = itemName.trim();
    const queryLower = query.toLowerCase();

    // If API key is available, use OpenAI
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert culinary writer and menu designer for a premium restaurant menu system called Afromenu.
Given a food item name, generate a highly appetizing, descriptive menu description (1-2 sentences).
Also include:
1. "Macros": Estimated primary macros (Calories, Protein, Carbs, Fats) based on typical portions.
2. "Allergens": Common allergens (e.g., Gluten, Dairy, Nuts, Soy, Shellfish, Eggs) present in this dish or say "None".

Keep the tone luxurious, elegant, and appealing. Format your response exactly like this:
[Appetizing Description]

🔥 Macros: ~[Calories] kcal | Protein: [P]g | Carbs: [C]g | Fat: [F]g
⚠️ Allergens: [Allergen names or None]`
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        });

        const generatedText = response.choices[0]?.message?.content?.trim();
        if (generatedText) {
          return NextResponse.json({ description: generatedText });
        }
      } catch (openAiError) {
        console.error("OpenAI API call failed, falling back to local dictionary:", openAiError);
      }
    }

    // Fallback logic
    // 1. Try exact or partial match in fallback catalog
    let matchedDescription = "";
    for (const [key, desc] of Object.entries(fallbackDescriptions)) {
      if (queryLower.includes(key) || key.includes(queryLower)) {
        matchedDescription = desc;
        break;
      }
    }

    // 2. Generate a generic premium description if no catalog match
    if (!matchedDescription) {
      matchedDescription = `Delectable ${query} prepared with premium fresh ingredients and cooked to perfection, showcasing authentic regional flavors and aromatic spices.\n\n🔥 Macros: ~340 kcal | Protein: 14g | Carbs: 38g | Fat: 12g\n⚠️ Allergens: Please consult our staff.`;
    }

    return NextResponse.json({ description: matchedDescription });
  } catch (error) {
    console.error("Generate description error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
