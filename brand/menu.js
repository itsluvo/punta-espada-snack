/* Punta Espada Snack & Bar · Players menu — hand food, USD + 18% tax */
window.GOLF_MENU = [
  // Breakfast
  { id: "fruit-bowl", cat: "breakfast", name: "Fruit Bowl", desc: "Tropical fruit", price: 10 },
  { id: "jimenez", cat: "breakfast", name: "Jimenez (The Mechanic) Classic", desc: "2 fried eggs, bacon, toast, avocado, orange marmalade", price: 11 },
  { id: "pancakes", cat: "breakfast", name: "Pancakes", desc: "3 pancakes and bacon", price: 12 },
  { id: "american-breakfast", cat: "breakfast", name: "American Breakfast", desc: "Pancake, egg and bacon", price: 13 },
  { id: "french-club", cat: "breakfast", pcat: "sandwiches", players: true, name: "French Club Sandwich", desc: "Omelette, bacon, onion, ham and cheese", price: 14 },
  { id: "campesino", cat: "breakfast", name: "Campesino Breakfast", desc: "Mangú de guineo, grill cheese, eggs and sausage", price: 14 },
  { id: "dominican-breakfast", cat: "breakfast", name: "Dominican Breakfast", desc: "Mangú with onions, egg, salami and fried cheese", price: 14 },
  { id: "benedicts", cat: "breakfast", name: "Classic Benedicts", desc: "7-grain bread, poached egg, ham, hollandaise", price: 15 },
  { id: "avocado-toast", cat: "breakfast", name: "Avocado Toast", desc: "2 toasts, avocado, tomato, arugula, eggs of your choice", price: 16, pick: { label: "Eggs", choices: ["Fried", "Scrambled", "Poached"] } },
  { id: "omelette", cat: "breakfast", name: "Build Your Omelette", desc: "5 ingredients max. White or brown toast included.", price: 15, omelette: true },

  // To share
  { id: "croquette", cat: "share", pcat: "share", players: true, name: "Chicken Croquette", desc: "3 chicken croquettes", price: 8 },
  { id: "cheese-balls", cat: "share", pcat: "share", players: true, name: "Cheese Balls", desc: "3 cheese balls", price: 8 },
  { id: "tequenos", cat: "share", pcat: "share", players: true, name: "Tequeños", desc: "3 cheese tequeños", price: 10 },
  { id: "pasty", cat: "share", pcat: "share", players: true, name: "Dominican Pasty", desc: "3 pastelitos — cheddar or beef mechada", price: 10, pick: { label: "Filling", choices: ["Cheddar", "Beef mechada"] } },
  { id: "onion-rings", cat: "share", pcat: "share", players: true, name: "Onion Rings", desc: "With honey mustard", price: 10 },
  { id: "mozz-sticks", cat: "share", pcat: "share", players: true, name: "Mozzarella Sticks", desc: "4 sticks", price: 10 },
  { id: "nachos", cat: "share", pcat: "share", players: true, name: "Nachos Bowl", desc: "Cheese, pico de gallo and beans", price: 14 },

  // Salads
  { id: "tex-mex", cat: "salads", name: "Tex-Mex Salad", desc: "Chicken, pico, beans, corn, bacon, toasts, tex-mex dressing", price: 14 },
  { id: "quinoa", cat: "salads", name: "Quinoa Salad", desc: "Chicken, tomato, peppers, beans and cilantro", price: 14 },
  { id: "cesar", cat: "salads", name: "Chicken César Salad", desc: "Grill chicken, parmesan, croutons, César dressing", price: 15 },
  { id: "nicklaus", cat: "salads", name: "Nicklaus Salad", desc: "Cherry tomato, almonds, goat cheese, tangerine, parmesan, vinaigrette", price: 16 },

  // Sandwiches
  { id: "caddy", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Dominican Caddy Sandwich", desc: "Salami, cheddar, ham and tomato", price: 7 },
  { id: "ham-cheese", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Ham & Cheese", desc: "Lettuce, tomato and onion", price: 8 },
  { id: "english-muffin", cat: "sandwiches", pcat: "sandwiches", players: true, name: "English Muffin Sandwich", desc: "Fried eggs, cheddar and bacon", price: 9 },
  { id: "pesto-capresa", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Pesto Capresa", desc: "Mozzarella, tomato and pesto", price: 12 },
  { id: "cuban", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Cuban", desc: "Pork loin, ham, cheese, mustard and pickle", price: 12 },
  { id: "midnight", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Midnight", desc: "Sobao bread, pork loin, ham, cheese, mustard and pickle", price: 12 },
  { id: "double-bogey", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Double Bogey", desc: "Prosciutto, mozzarella, arugula, tomato, olive oil", price: 13 },
  { id: "chicken-caesar-sw", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Chicken Caesar Sandwich", desc: "Chicken, bacon, lettuce, Caesar sauce", price: 14 },
  { id: "camilo-way", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Camilo Way", desc: "2 mini croissants, prosciutto, mozzarella, arugula, tomato, olive oil", price: 14 },
  { id: "wakaciutto", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Wakaciutto", desc: "Baguette, guacamole, prosciutto, arugula and tomato", price: 14 },
  { id: "italian-sw", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Italian Sandwich", desc: "Pastrami, ham, cheese, salami, pickles and mustard", price: 14 },
  { id: "chicken-honey", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Chicken Honey", desc: "Chicken, cheese, bacon, tomato, lettuce, honey mustard", price: 14 },
  { id: "tiger-club", cat: "sandwiches", pcat: "sandwiches", players: true, name: "Tiger Club Sandwich", desc: "Chicken, ham, cheese, bacon, onion, tomato and lettuce", price: 15 },

  // Chef
  { id: "hot-dog", cat: "chef", pcat: "dogs", players: true, name: "Classic Hot Dog", desc: "Classic sausage and sauces", price: 7 },
  { id: "dominican-lunch", cat: "chef", name: "Dominican Lunch", desc: "Ask about the chef's choice", price: 10 },
  { id: "german-dog", cat: "chef", pcat: "dogs", players: true, name: "German Hot Dog", desc: "German sausage and classic sauces", price: 11 },
  { id: "egg-quesadilla", cat: "chef", pcat: "tacos", players: true, name: "Egg Quesadilla", desc: "Scrambled eggs, cheddar, sour cream, pico de gallo", price: 12 },
  { id: "tacos", cat: "chef", pcat: "tacos", players: true, name: "The Real 3 Tacos", desc: "3 beef tacos, onion, cilantro and lemon", price: 13 },
  { id: "chicken-burger", cat: "chef", pcat: "burgers", players: true, name: "Chicken Burger Sandwich", desc: "Grill chicken and vegetables", price: 14 },
  { id: "chicken-quesadilla", cat: "chef", pcat: "tacos", players: true, name: "Chicken Quesadilla", desc: "Sour cream and vegetables", price: 14 },
  { id: "chicken-grill", cat: "chef", name: "Chicken Grill", desc: "French fries and vegetables", price: 14 },
  { id: "bacon-cheese-burger", cat: "chef", pcat: "burgers", players: true, name: "Bacon Cheese Burger", desc: "Angus beef 6oz, cheddar, bacon, lettuce, tomato, onion", price: 15 },
  { id: "beef-quesadilla", cat: "chef", pcat: "tacos", players: true, name: "Beef Quesadilla", desc: "Sour cream and pico de gallo", price: 15 },
  { id: "penne-carbonara", cat: "chef", name: "Penne Carbonara", desc: "Penne, carbonara sauce, toasts", price: 15 },
  { id: "bolognese", cat: "chef", name: "Spaghetti Bolognese", desc: "Bolognese sauce and toasts", price: 15 },
  { id: "porcini", cat: "chef", name: "Spaghetti with Porcini Mushrooms", desc: "Creamy porcini sauce and toasts", price: 16 },

  // Juices
  { id: "lemonade", cat: "juices", name: "Lemonade", price: 8 },
  { id: "lemonade-mint", cat: "juices", name: "Lemonade Mint", price: 9 },
  { id: "passionfruit", cat: "juices", name: "Passionfruit", price: 8 },
  { id: "strawberry", cat: "juices", name: "Strawberry", price: 10 },
  { id: "pineapple", cat: "juices", name: "Pineapple", price: 8 },
  { id: "lechoza", cat: "juices", name: "Lechoza", price: 8 },
  { id: "pineapple-mint", cat: "juices", name: "Pineapple Mint", price: 10 },
  { id: "detox", cat: "juices", name: "Detox", desc: "Cucumber, green apple and mint", price: 9 },
  { id: "diuretico", cat: "juices", name: "Diurético", desc: "Cucumber, celery, pineapple and lemon", price: 10 },
  { id: "desinflamatorio", cat: "juices", name: "Desinflamatorio", desc: "Pineapple, celery, strawberry and lemon", price: 11 },

  // Hot drinks
  { id: "espresso", cat: "hot", name: "Espresso", price: 6 },
  { id: "cortadito", cat: "hot", name: "Cortadito", price: 7 },
  { id: "coffee-milk", cat: "hot", name: "Coffee with Milk", price: 7 },
  { id: "capp-italian", cat: "hot", name: "Italian Cappuccino", price: 8 },
  { id: "capp-american", cat: "hot", name: "American Cappuccino", price: 9 },
  { id: "capp-caramel", cat: "hot", name: "Caramel Cappuccino", price: 10 },
  { id: "capp-almond", cat: "hot", name: "Almond Cappuccino", price: 10 },
  { id: "mochaccino", cat: "hot", name: "Mochaccino", price: 10 },
  { id: "hot-chocolate", cat: "hot", name: "Hot Chocolate", price: 9 },
  { id: "tea", cat: "hot", name: "Tea", price: 6 },

  // Cold / bar
  { id: "beer-national", cat: "drinks", name: "National Beer", price: 7, pick: { label: "Beer", choices: ["Presidente", "Presidente Light", "Corona", "Modelo"] } },
  { id: "beer-import", cat: "drinks", name: "Import Beer", price: 10, pick: { label: "Beer", choices: ["Heineken", "Coors Light"] } },
  { id: "smirnoff", cat: "drinks", name: "Smirnoff Ice", price: 8, pick: { label: "Flavor", choices: ["Original", "Green Apple"] } },
  { id: "wine-white", cat: "drinks", name: "White Wine", price: 8 },
  { id: "wine-red", cat: "drinks", name: "Red Wine", price: 8 },
  { id: "cava", cat: "drinks", name: "Cava", price: 14 },
  { id: "frapuccino", cat: "drinks", name: "Frapuccino", price: 9 },
  { id: "nutella-dream", cat: "drinks", name: "Nutella Dream", price: 11 },
  { id: "moccha-delight", cat: "drinks", name: "Moccha Delight", price: 9 },
  { id: "caramel-craving", cat: "drinks", name: "Caramel Craving", price: 10 },
  { id: "skinny-frappe", cat: "drinks", name: "Skinny Frappe", price: 9 },
  { id: "water", cat: "drinks", name: "Water", price: 6 },
  { id: "perrier", cat: "drinks", name: "Perrier", price: 7 },
  { id: "gatorade", cat: "drinks", name: "Gatorade", price: 5, pick: { label: "Flavor", choices: ["Cool Blue", "Orange", "Grape", "Fruit Cocktail"] } },
  { id: "pellegrino", cat: "drinks", name: "San Pellegrino", price: 7 },
  { id: "soda", cat: "drinks", name: "Soda", price: 4, pick: { label: "Soda", choices: ["Coke", "Coke Zero", "Sprite", "Club Soda", "Tonic"] } },
  { id: "sparkling-ice", cat: "drinks", name: "Sparkling Ice", price: 7 },
  { id: "acqua-panna", cat: "drinks", name: "Acqua Panna", price: 6 },
  { id: "coconut", cat: "drinks", name: "Coconut Water", price: 5 },
  { id: "clamato", cat: "drinks", name: "Clamato Juice", price: 6 },
  { id: "tomato-juice", cat: "drinks", name: "Tomato Juice", price: 6 },
  { id: "red-bull", cat: "drinks", name: "Red Bull", price: 8 },
];

window.GOLF_CATS = [
  { id: "share", label: "Snacks" },
  { id: "sandwiches", label: "Sandwiches" },
  { id: "burgers", label: "Burgers" },
  { id: "dogs", label: "Hot dogs" },
  { id: "tacos", label: "Mexican" },
];

window.OMELETTE_INGS = [
  "Turkey ham", "Cooked ham", "Bacon", "Cheddar", "Mozzarella",
  "Tomato", "Spinach", "Onion", "Peppers", "Corn",
];
window.BREADS = ["Baguette", "White", "Whole wheat"];
