import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'permalist',
  password: 'WhyPostgres?',
  port: 5432,
});

db.connect(err => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected');
  }
});

let items = [];

async function getAllItems() {
  const result = await db.query('SELECT * FROM items ORDER BY id ASC');
  items = result.rows;
  return items;
}

app.get('/', async (req, res) => {
  items = await getAllItems();
  console.log('items in /: ', items);
  res.render('index.ejs', {
    listTitle: 'Today',
    listItems: items,
  });
});

app.post('/add', async (req, res) => {
  const item = req.body.newItem;

  try {
    await db.query('INSERT INTO items (title) VALUES ($1)', [item]);
  } catch (err) {
    console.error(err);
  }

  res.redirect('/');
});

app.post('/edit', async (req, res) => {
  const item = req.body;
  await db.query('UPDATE items SET title = $1 WHERE id = $2', [
    item.updatedItemTitle,
    item.updatedItemId,
  ]);
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const itemId = req.body.deleteItemId;
  db.query('DELETE FROM items WHERE id = $1', [itemId]);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
