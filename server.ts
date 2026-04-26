import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  DataSource,
  Like as TypeORMLike
} from "typeorm";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// --- TypeORM Entities ---

@Entity()
class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", default: "user" })
  role!: string;

  @Column({ type: "boolean", default: false })
  isBlocked!: boolean;

  @OneToMany(() => Inventory, (inventory) => inventory.author)
  inventories!: Inventory[];

  @OneToMany(() => Item, (item) => item.author)
  items!: Item[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "text", nullable: true })
  category!: string;

  @Column({ type: "simple-array", nullable: true })
  tags!: string[];

  @Column({ type: "boolean", default: true })
  isPublic!: boolean;

  @Column({ type: "text", nullable: true })
  imageUrl!: string;

  @Column({ type: "text", nullable: true })
  idFormat!: string;

  @Column({ type: "simple-json", nullable: true })
  idElements!: any[];

  @Column({ type: "integer", default: 0 })
  version!: number;

  @ManyToOne(() => User, (user) => user.inventories, { onDelete: "CASCADE" })
  author!: User;

  @Column({ type: "text" })
  authorId!: string;

  @OneToMany(() => Item, (item) => item.inventory)
  items!: Item[];

  @OneToMany(() => Comment, (comment) => comment.inventory)
  comments!: Comment[];

  // Custom Fields Schema
  @Column({ type: "boolean", default: false }) custom_string1_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_string1_name!: string;
  @Column({ type: "boolean", default: false }) custom_string2_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_string2_name!: string;
  @Column({ type: "boolean", default: false }) custom_string3_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_string3_name!: string;

  @Column({ type: "boolean", default: false }) custom_int1_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_int1_name!: string;
  @Column({ type: "boolean", default: false }) custom_int2_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_int2_name!: string;
  @Column({ type: "boolean", default: false }) custom_int3_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_int3_name!: string;

  @Column({ type: "boolean", default: false }) custom_bool1_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_bool1_name!: string;
  @Column({ type: "boolean", default: false }) custom_bool2_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_bool2_name!: string;
  @Column({ type: "boolean", default: false }) custom_bool3_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_bool3_name!: string;

  @Column({ type: "boolean", default: false }) custom_text1_state!: boolean;
  @Column({ type: "text", nullable: true }) custom_text1_name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
class Item {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", nullable: true })
  customId!: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.items, { onDelete: "CASCADE" })
  inventory!: Inventory;

  @Column({ type: "text" })
  inventoryId!: string;

  @ManyToOne(() => User, (user) => user.items, { onDelete: "CASCADE" })
  author!: User;

  @Column({ type: "text" })
  authorId!: string;

  // Custom Field Values
  @Column({ type: "text", nullable: true }) custom_string1_value!: string;
  @Column({ type: "text", nullable: true }) custom_string2_value!: string;
  @Column({ type: "text", nullable: true }) custom_string3_value!: string;
  @Column({ type: "float", nullable: true }) custom_int1_value!: number;
  @Column({ type: "float", nullable: true }) custom_int2_value!: number;
  @Column({ type: "float", nullable: true }) custom_int3_value!: number;
  @Column({ type: "boolean", nullable: true }) custom_bool1_value!: boolean;
  @Column({ type: "boolean", nullable: true }) custom_bool2_value!: boolean;
  @Column({ type: "boolean", nullable: true }) custom_bool3_value!: boolean;
  @Column({ type: "text", nullable: true }) custom_text1_value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ type: "text" })
  userId!: string;

  @ManyToOne(() => Item, { onDelete: "CASCADE" })
  item!: Item;

  @Column({ type: "text" })
  itemId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.comments, { onDelete: "CASCADE" })
  inventory!: Inventory;

  @Column({ type: "text" })
  inventoryId!: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  author!: User;

  @Column({ type: "text" })
  authorId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

// --- DataSource ---
const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true, // Auto-create tables (use only for dev)
  logging: false,
  entities: [User, Inventory, Item, Like, Comment],
  subscribers: [],
  migrations: [],
});

// --- Server Setup ---
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use(cookieParser());

// --- Repositories ---
const userRepository = AppDataSource.getRepository(User);
const inventoryRepository = AppDataSource.getRepository(Inventory);
const itemRepository = AppDataSource.getRepository(Item);
const likeRepository = AppDataSource.getRepository(Like);
const commentRepository = AppDataSource.getRepository(Comment);

// --- Middleware ---
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await userRepository.findOneBy({ id: decoded.userId });
    if (!user || user.isBlocked) return res.status(401).json({ error: "Unauthorized or Blocked" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

const generateCustomId = async (inventory: Inventory): Promise<string> => {
  if (!inventory.idElements || inventory.idElements.length === 0) {
    return `ITEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  let id = "";
  const itemCount = await itemRepository.countBy({ inventoryId: inventory.id });
  const seqValue = itemCount + 1;
  const now = new Date();

  for (const el of inventory.idElements) {
    try {
      if (el.type === "fixed") {
        id += el.value || "";
      } else if (el.type === "random_20") {
        const rand = Math.floor(Math.random() * 1048576);
        const match = el.value?.match(/^([XD])(\d+)(.*)$/);
        if (match) {
          const [_, type, lenStr, suffix] = match;
          const len = parseInt(lenStr);
          const val = type === "X" ? rand.toString(16).toUpperCase() : rand.toString();
          id += val.padStart(len, "0") + suffix;
        } else {
          id += rand.toString(16).toUpperCase().padStart(5, "0");
        }
      } else if (el.type === "sequence") {
        const match = el.value?.match(/^D(\d+)(.*)$/);
        if (match) {
          const [_, lenStr, suffix] = match;
          const len = parseInt(lenStr);
          id += seqValue.toString().padStart(len, "0") + suffix;
        } else {
          id += seqValue.toString();
        }
      } else if (el.type === "datetime") {
        let dt = el.value || "";
        dt = dt.replace("yyyy", now.getFullYear().toString());
        dt = dt.replace("yy", now.getFullYear().toString().slice(-2));
        dt = dt.replace("MM", (now.getMonth() + 1).toString().padStart(2, "0"));
        dt = dt.replace("dd", now.getDate().toString().padStart(2, "0"));
        dt = dt.replace("HH", now.getHours().toString().padStart(2, "0"));
        dt = dt.replace("mm", now.getMinutes().toString().padStart(2, "0"));
        dt = dt.replace("ss", now.getSeconds().toString().padStart(2, "0"));
        id += dt;
      }
    } catch (e) {
      console.error("Error generating ID element", e);
    }
  }
  return id || `ITEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

// --- API Routes ---

// AUTH
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await userRepository.findOneBy({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ 
      email, 
      password: hashedPassword, 
      name, 
      role: "user" 
    });
    
    await userRepository.save(user);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepository.findOneBy({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (user.isBlocked) return res.status(403).json({ error: "Account blocked" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role } });
});

// INVENTORIES
app.get("/api/inventories", async (req, res) => {
  const inventories = await inventoryRepository.find({
    relations: ["author"],
    order: { createdAt: "DESC" }
  });
  res.json(inventories);
});

app.get("/api/inventories/latest", async (req, res) => {
  const inventories = await inventoryRepository.find({
    relations: ["author"],
    order: { createdAt: "DESC" },
    take: 10
  });
  res.json(inventories);
});

app.get("/api/inventories/popular", async (req, res) => {
  // Query to get inventories with item count
  const inventories = await inventoryRepository.createQueryBuilder("inventory")
    .leftJoinAndSelect("inventory.author", "author")
    .loadRelationCountAndMap("inventory.itemCount", "inventory.items")
    .orderBy("inventory.createdAt", "DESC")
    .limit(5)
    .getMany();
    
  // TypeORM doesn't directly sort by virtual count in one go easily without subtables or raw query,
  // but for 5 items we can just map and sort after if needed.
  // Actually let's just use the mapper for _count compatibility
  const mapped = inventories.map(inv => ({
    ...inv,
    _count: { items: (inv as any).itemCount }
  }));
  res.json(mapped);
});

app.get("/api/inventories/:id", async (req, res) => {
  const inventory = await inventoryRepository.findOne({
    where: { id: req.params.id },
    relations: ["author"]
  });
  if (!inventory) return res.status(404).json({ error: "Not found" });
  
  const items = await itemRepository.find({
    where: { inventoryId: req.params.id }
  });

  const itemsWithLikes = await Promise.all(items.map(async (item) => {
    const likeCount = await likeRepository.countBy({ itemId: item.id });
    return { ...item, _count: { likes: likeCount } };
  }));

  res.json({ 
    ...inventory, 
    items: itemsWithLikes 
  });
});

app.post("/api/inventories", authenticate, async (req: any, res) => {
  const inventory = inventoryRepository.create({
    ...req.body,
    authorId: req.user.id
  });
  await inventoryRepository.save(inventory);
  res.json(inventory);
});

app.put("/api/inventories/:id", authenticate, async (req: any, res) => {
  const inventory = await inventoryRepository.findOneBy({ id: req.params.id });
  if (!inventory) return res.status(404).json({ error: "Not found" });
  
  if (inventory.authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  if (inventory.version !== req.body.version) {
    return res.status(409).json({ error: "Conflict: Submitting stale data" });
  }

  const updatedInventory = {
    ...inventory,
    ...req.body,
    version: inventory.version + 1
  };
  
  await inventoryRepository.save(updatedInventory);
  res.json(updatedInventory);
});

// ITEMS
app.get("/api/inventories/:inventoryId/items", async (req, res) => {
  const items = await itemRepository.find({
    where: { inventoryId: req.params.inventoryId }
  });
  const itemsWithLikes = await Promise.all(items.map(async (item) => {
    const likeCount = await likeRepository.countBy({ itemId: item.id });
    return { ...item, _count: { likes: likeCount } };
  }));
  res.json(itemsWithLikes);
});

app.post("/api/inventories/:inventoryId/items", authenticate, async (req: any, res) => {
  const inventory = await inventoryRepository.findOneBy({ id: req.params.inventoryId });
  if (!inventory) return res.status(404).json({ error: "Inventory not found" });

  const customId = await generateCustomId(inventory);

  const item = itemRepository.create({
    ...req.body,
    customId,
    inventoryId: req.params.inventoryId,
    authorId: req.user.id
  });
  await itemRepository.save(item);
  res.json(item);
});

app.get("/api/items/:id", async (req, res) => {
  const item = await itemRepository.findOneBy({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.put("/api/items/:id", authenticate, async (req: any, res) => {
  const item = await itemRepository.findOneBy({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  
  if (item.authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updatedItem = {
    ...item,
    ...req.body
  };
  
  await itemRepository.save(updatedItem);
  res.json(updatedItem);
});

app.delete("/api/items/:id", authenticate, async (req: any, res) => {
  const item = await itemRepository.findOneBy({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  
  if (item.authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  await itemRepository.remove(item);
  res.json({ message: "Deleted" });
});

// LIKES
app.get("/api/inventories/:id/likes", async (req, res) => {
  const count = await likeRepository.countBy({ itemId: req.params.id });
  res.json({ count, isLiked: false });
});

// COMMENTS
app.get("/api/inventories/:inventoryId/comments", async (req, res) => {
  const comments = await commentRepository.find({
    where: { inventoryId: req.params.inventoryId },
    relations: ["author"],
    order: { createdAt: "ASC" }
  });
  res.json(comments);
});

app.post("/api/inventories/:inventoryId/comments", authenticate, async (req: any, res) => {
  const comment = commentRepository.create({
    text: req.body.text,
    inventoryId: req.params.inventoryId,
    authorId: req.user.id
  });
  await commentRepository.save(comment);
  
  const populated = await commentRepository.findOne({
    where: { id: comment.id },
    relations: ["author"]
  });

  io.to(`inventory:${req.params.inventoryId}`).emit("comment:new", populated);
  res.json(populated);
});

app.get("/api/users/me/inventories", authenticate, async (req: any, res) => {
  const inventories = await inventoryRepository.find({
    where: { authorId: req.user.id },
    order: { updatedAt: "DESC" }
  });
  res.json(inventories);
});

// ADMIN
app.get("/api/admin/users", authenticate, adminOnly, async (req, res) => {
  const users = await userRepository.find();
  res.json(users);
});

app.patch("/api/admin/users/:id", authenticate, adminOnly, async (req, res) => {
  const user = await userRepository.findOneBy({ id: req.params.id });
  if (!user) return res.status(404).json({ error: "Not found" });
  
  Object.assign(user, req.body);
  await userRepository.save(user);
  res.json(user);
});

app.delete("/api/admin/users/:id", authenticate, adminOnly, async (req, res) => {
  const user = await userRepository.findOneBy({ id: req.params.id });
  if (user) {
    await userRepository.remove(user);
  }
  res.json({ message: "User deleted" });
});

// SEARCH
app.get("/api/search", async (req, res) => {
  const q = (req.query.q as string || "").toLowerCase();
  
  const results = await inventoryRepository.find({
    where: [
      { isPublic: true, title: TypeORMLike(`%${q}%`) },
      { isPublic: true, description: TypeORMLike(`%${q}%`) },
      { isPublic: true, category: TypeORMLike(`%${q}%`) }
      // simple-array doesn't support easy Like on search without raw SQL or custom logic
    ],
    relations: ["author"]
  });
  res.json(results);
});

io.on("connection", (socket) => {
  socket.on("join:inventory", (inventoryId) => {
    socket.join(`inventory:${inventoryId}`);
  });
  socket.on("leave:inventory", (inventoryId) => {
    socket.leave(`inventory:${inventoryId}`);
  });
});

// --- Vite Middleware ---
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization", err);
  }
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


