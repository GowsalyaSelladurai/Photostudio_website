
type StoredAlbumPhoto = {
  id: string;
  projectId: string;
  photoId: string;
  blob: Blob;
  fileName: string;
  savedAt: number;
};

const DATABASE_NAME = "studioframe-albums";
const DATABASE_VERSION = 1;
const STORE_NAME = "photos";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(
      new Error("Your browser does not support persistent photo storage."),
    );
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("projectId", "projectId", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      databasePromise = null;
      reject(new Error("Unable to open album photo storage."));
    };

    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("Album photo storage is blocked by another tab."));
    };
  });

  return databasePromise;
}

function createPhotoKey(projectId: string, photoId: string): string {
  return `${projectId}:${photoId}`;
}

export async function saveAlbumPhoto(
  projectId: string,
  photoId: string,
  file: File,
): Promise<void> {
  const database = await openDatabase();

  const transaction = database.transaction(STORE_NAME, "readwrite");

  const record: StoredAlbumPhoto = {
    id: createPhotoKey(projectId, photoId),
    projectId,
    photoId,
    blob: file,
    fileName: file.name,
    savedAt: Date.now(),
  };

  transaction.objectStore(STORE_NAME).put(record);

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error("Unable to save this photograph."));
    transaction.onabort = () =>
      reject(new Error("Photo saving was cancelled."));
  });
}

export async function getAlbumPhoto(
  projectId: string,
  photoId: string,
): Promise<Blob | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction
      .objectStore(STORE_NAME)
      .get(createPhotoKey(projectId, photoId));

    request.onsuccess = () => {
      const record = request.result as StoredAlbumPhoto | undefined;
      resolve(record?.blob ?? null);
    };

    request.onerror = () => {
      reject(new Error("Unable to retrieve this photograph."));
    };
  });
}

export async function deleteAlbumPhoto(
  projectId: string,
  photoId: string,
): Promise<void> {
  const database = await openDatabase();

  const transaction = database.transaction(STORE_NAME, "readwrite");

  transaction.objectStore(STORE_NAME).delete(
    createPhotoKey(projectId, photoId),
  );

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error("Unable to remove this photograph."));
    transaction.onabort = () =>
      reject(new Error("Photo removal was cancelled."));
  });
}

export async function deleteAlbumPhotos(
  projectId: string,
): Promise<void> {
  const database = await openDatabase();

  const transaction = database.transaction(STORE_NAME, "readwrite");
  const index = transaction
    .objectStore(STORE_NAME)
    .index("projectId");

  const request = index.openCursor(IDBKeyRange.only(projectId));

  request.onsuccess = () => {
    const cursor = request.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error("Unable to clear album photographs."));
    transaction.onabort = () =>
      reject(new Error("Photo removal was cancelled."));
  });
}
