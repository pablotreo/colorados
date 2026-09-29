export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  attempts: number;
}

const DB_NAME = 'colorados-offline';
const DB_VERSION = 1;
const STORE_NAME = 'contact-messages';
let activeFlush: Promise<number> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPendingMessages(): Promise<ContactMessage[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as ContactMessage[]);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function removeMessage(id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export async function queueContact(message: ContactMessage): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(message);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  window.dispatchEvent(new CustomEvent('colorados:contact-queue', { detail: { pending: await getPendingContactCount() } }));
}

export async function getPendingContactCount(): Promise<number> {
  return (await readPendingMessages()).length;
}

export async function sendContact(message: ContactMessage): Promise<void> {
  const body = new URLSearchParams({
    'form-name': 'contacto',
    'submission-id': message.id,
    name: message.name,
    email: message.email,
    message: message.message,
  });
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Netlify Forms respondió ${response.status}`);
}

export function flushContactQueue(): Promise<number> {
  if (activeFlush) return activeFlush;
  activeFlush = (async () => {
    if (!navigator.onLine) return getPendingContactCount();
    const messages = await readPendingMessages();
    let sent = 0;
    for (const message of messages) {
      try {
        await sendContact({ ...message, attempts: message.attempts + 1 });
        await removeMessage(message.id);
        sent += 1;
      } catch {
        break;
      }
    }
    const pending = await getPendingContactCount();
    window.dispatchEvent(new CustomEvent('colorados:contact-queue', { detail: { pending, sent } }));
    return pending;
  })().finally(() => { activeFlush = undefined; });
  return activeFlush;
}
