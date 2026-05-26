import { prisma } from "./prisma";

export async function seedEstablishmentData(establishmentId: string) {
  console.log("Seeding comprehensive sample menu data for establishment:", establishmentId);
  try {
    // 1. BURGERS (Food)
    const burgersCat = await prisma.category.create({
      data: {
        establishmentId,
        name: "BURGERS",
        sectionName: "Food",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        sortOrder: 0,
        isVisible: true,
      },
    });

    await prisma.item.createMany({
      data: [
        {
          categoryId: burgersCat.id,
          name: "Classic Burger",
          price: 8.00,
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
          description: "Premium beef patty with fresh lettuce, tomato, and house burger sauce.",
          sortOrder: 0,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: burgersCat.id,
          name: "Cheese Burger",
          price: 9.00,
          imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
          description: "Melted cheddar cheese on toasted brioche bun with crispy pickles.",
          sortOrder: 1,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: burgersCat.id,
          name: "BBQ Burger",
          price: 10.00,
          imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
          description: "Caramelized onions, smoked bacon, cheddar, and sweet hickory BBQ sauce.",
          sortOrder: 2,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: burgersCat.id,
          name: "Veggie Burger",
          price: 7.00,
          imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
          description: "Flame-grilled plant-based patty with fresh avocado and garlic aioli.",
          sortOrder: 3,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: burgersCat.id,
          name: "Double Burger",
          price: 12.00,
          imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
          description: "Two premium beef patties, double cheese, and visual gourmand stacking.",
          sortOrder: 4,
          isAvailable: true,
          isVisible: true,
        },
      ],
    });

    // 2. PIZZAS (Food)
    const pizzasCat = await prisma.category.create({
      data: {
        establishmentId,
        name: "PIZZAS",
        sectionName: "Food",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        sortOrder: 1,
        isVisible: true,
      },
    });

    await prisma.item.createMany({
      data: [
        {
          categoryId: pizzasCat.id,
          name: "Margherita",
          price: 10.00,
          imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
          description: "Traditional Italian mozzarella, rich tomato marinara, and fresh basil leaves.",
          sortOrder: 0,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: pizzasCat.id,
          name: "Pepperoni",
          price: 12.00,
          imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
          description: "Generous spicy pepperoni slices with premium mozzarella cheese blend.",
          sortOrder: 1,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: pizzasCat.id,
          name: "BBQ Chicken",
          price: 13.00,
          imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
          description: "Tender grilled chicken pieces, red onions, cilantro, and bold sweet BBQ sauce.",
          sortOrder: 2,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: pizzasCat.id,
          name: "Veggie Pizza",
          price: 11.00,
          imageUrl: "https://images.unsplash.com/photo-1511689660979-10d2b1afd49d?w=400",
          description: "Bell peppers, sweet onions, black olives, mushrooms, and fresh baby spinach.",
          sortOrder: 3,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: pizzasCat.id,
          name: "Four Cheese",
          price: 14.00,
          imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
          description: "Artisanal blend of mozzarella, parmesan, gorgonzola, and creamy ricotta.",
          sortOrder: 4,
          isAvailable: true,
          isVisible: true,
        },
      ],
    });

    // 3. COLD DRINKS (Drinks)
    const coldDrinksCat = await prisma.category.create({
      data: {
        establishmentId,
        name: "COLD DRINKS",
        sectionName: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800",
        sortOrder: 2,
        isVisible: true,
      },
    });

    await prisma.item.createMany({
      data: [
        {
          categoryId: coldDrinksCat.id,
          name: "Fresh Juice",
          price: 3.00,
          imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
          description: "Freshly squeezed seasonal fruits served cold over crushed ice.",
          sortOrder: 0,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: coldDrinksCat.id,
          name: "Lemonade",
          price: 2.50,
          imageUrl: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400",
          description: "Tangy fresh lemon juice sweetened with organic pure cane sugar.",
          sortOrder: 1,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: coldDrinksCat.id,
          name: "Mango Smoothie",
          price: 4.00,
          imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
          description: "Creamy blend of ripe tropical mangoes, Greek yogurt, and honey.",
          sortOrder: 2,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: coldDrinksCat.id,
          name: "Iced Coffee",
          price: 3.50,
          imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
          description: "Robust espresso shots blended with organic milk and vanilla syrup.",
          sortOrder: 3,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: coldDrinksCat.id,
          name: "Cola",
          price: 2.00,
          imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
          description: "Classic sparkling soda can served ice-cold.",
          sortOrder: 4,
          isAvailable: true,
          isVisible: true,
        },
      ],
    });

    // 4. HOT DRINKS (Drinks)
    const hotDrinksCat = await prisma.category.create({
      data: {
        establishmentId,
        name: "HOT DRINKS",
        sectionName: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        sortOrder: 3,
        isVisible: true,
      },
    });

    await prisma.item.createMany({
      data: [
        {
          categoryId: hotDrinksCat.id,
          name: "Espresso",
          price: 2.00,
          imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
          description: "Concentrated double shot of dark roasted premium arabica beans.",
          sortOrder: 0,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: hotDrinksCat.id,
          name: "Cappuccino",
          price: 3.00,
          imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
          description: "Bold espresso layered with warm steamed milk and thick microfoam.",
          sortOrder: 1,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: hotDrinksCat.id,
          name: "Latte",
          price: 3.50,
          imageUrl: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400",
          description: "Smooth steamed milk poured over double shot espresso with light foam.",
          sortOrder: 2,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: hotDrinksCat.id,
          name: "Green Tea",
          price: 2.50,
          imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
          description: "Steeped organic green tea leaves rich in calming antioxidants.",
          sortOrder: 3,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: hotDrinksCat.id,
          name: "Hot Chocolate",
          price: 3.50,
          imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
          description: "Decadent melted cocoa beans frothed with steamed milk and cream.",
          sortOrder: 4,
          isAvailable: true,
          isVisible: true,
        },
      ],
    });

    // 5. DESSERTS (Desserts)
    const dessertsCat = await prisma.category.create({
      data: {
        establishmentId,
        name: "DESSERTS",
        sectionName: "Desserts",
        imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
        sortOrder: 4,
        isVisible: true,
      },
    });

    await prisma.item.createMany({
      data: [
        {
          categoryId: dessertsCat.id,
          name: "Chocolate Cake",
          price: 5.00,
          imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
          description: "Rich dark chocolate sponge cake frothed with warm chocolate fudge syrup.",
          sortOrder: 0,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: dessertsCat.id,
          name: "Ice Cream",
          price: 3.00,
          imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
          description: "Three generous scoops of fresh Madagascar vanilla bean ice cream.",
          sortOrder: 1,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: dessertsCat.id,
          name: "Cheesecake",
          price: 6.00,
          imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400",
          description: "Classic New York cheesecake slice on crisp graham cracker base.",
          sortOrder: 2,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: dessertsCat.id,
          name: "Brownie",
          price: 4.00,
          imageUrl: "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400",
          description: "Warm fudgy chocolate brownie square studded with crunchy walnut halves.",
          sortOrder: 3,
          isAvailable: true,
          isVisible: true,
        },
        {
          categoryId: dessertsCat.id,
          name: "Tiramisu",
          price: 5.50,
          imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
          description: "Espresso soaked ladyfingers layered frothed with mascarpone sabayon cream.",
          sortOrder: 4,
          isAvailable: true,
          isVisible: true,
        },
      ],
    });

    console.log("Establishment sample menu seeded successfully!");
  } catch (err) {
    console.error("Error in seedEstablishmentData helper:", err);
  }
}
