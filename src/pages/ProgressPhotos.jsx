import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { storage } from "../firebase";
import {
  ref,
  uploadBytesResumable,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";

export default function ProgressPhotos() {
  const { user, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingPath, setDeletingPath] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef(null);

  const folderPath = user?.uid ? `progress-photos/${user.uid}` : null;

  const loadPhotos = useCallback(async () => {
    if (!folderPath) {
      setPhotos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      const mapped = await Promise.all(
        result.items.map(async (item) => {
          const [url, metadata] = await Promise.all([
            getDownloadURL(item),
            getMetadata(item),
          ]);
          const uploadedAt =
            metadata.customMetadata?.uploadedAt || metadata.timeCreated;
          return {
            url,
            path: item.fullPath,
            name: metadata.customMetadata?.originalName || item.name,
            uploadedAt,
            note: metadata.customMetadata?.note || "",
          };
        })
      );
      mapped.sort(
        (a, b) =>
          new Date(b.uploadedAt).valueOf() - new Date(a.uploadedAt).valueOf()
      );
      setPhotos(mapped);
    } catch (err) {
      if (err.code === "storage/object-not-found") {
        setPhotos([]);
      } else {
        console.error("load photos failed", err);
        setError("Failed to load photos");
      }
    } finally {
      setLoading(false);
    }
  }, [folderPath]);

  useEffect(() => {
    if (authLoading) return;
    loadPhotos();
  }, [authLoading, loadPhotos]);

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }

  function handleFileClick() {
    if (!user) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUpload() {
    if (!selectedFile) {
      setError("Please choose a photo first.");
      return;
    }
    if (!folderPath) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const safeName = `${Date.now()}-${selectedFile.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")}`;
    const fileRef = ref(storage, `${folderPath}/${safeName}`);
    const trimmedNote = note.trim();
    const metadata = {
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: selectedFile.name,
        note: trimmedNote,
      },
    };

    const task = uploadBytesResumable(fileRef, selectedFile, metadata);
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(pct);
      },
      (err) => {
        console.error("upload failed", err);
        setError("Upload failed. Please try again.");
        setUploading(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          const [url, meta] = await Promise.all([
            getDownloadURL(task.snapshot.ref),
            getMetadata(task.snapshot.ref),
          ]);
          const uploadedAt =
            meta.customMetadata?.uploadedAt || meta.timeCreated;
          const newPhoto = {
            url,
            path: task.snapshot.ref.fullPath,
            name: meta.customMetadata?.originalName || selectedFile.name,
            uploadedAt,
            note: meta.customMetadata?.note || trimmedNote,
          };
          setPhotos((prev) => [newPhoto, ...prev]);
        } catch (err) {
          console.error("post-upload load failed", err);
          loadPhotos();
        } finally {
          setUploading(false);
          setUploadProgress(0);
          setNote("");
          clearSelectedFile();
          setPreviewUrl(null);
        }
      }
    );
  }

  async function handleDelete(path) {
    if (!path) return;
    const confirmed = window.confirm("Delete this photo permanently?");
    if (!confirmed) return;
    setDeletingPath(path);
    try {
      await deleteObject(ref(storage, path));
      setPhotos((prev) => prev.filter((p) => p.path !== path));
    } catch (err) {
      console.error("delete failed", err);
      setError("Failed to delete photo");
    } finally {
      setDeletingPath(null);
    }
  }

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to manage progress photos.</div>;
  }

  return (
    <div>
      <h2>Progress Photos</h2>
      <p>Upload images to track how your training is going over time.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div style={{ margin: "16px 0", maxWidth: 480 }}>
        <label style={{ display: "block", textAlign: "left", marginBottom: 4 }}>
          Optional note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Week 4 cut-in, morning lighting"
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
          disabled={uploading}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button onClick={handleFileClick} disabled={uploading}>
          Choose Photo
        </button>
        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        {uploading && <span>{uploadProgress}%</span>}
      </div>

      {selectedFile && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 14 }}>
            Selected: <strong>{selectedFile.name}</strong>
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={uploading}
              style={{ marginLeft: 8 }}
            >
              Clear
            </button>
          </div>
          {previewUrl && (
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #eee",
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      )}

      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading photos…</div>
      ) : photos.length === 0 ? (
        <div style={{ marginTop: 16 }}>No photos uploaded yet.</div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.path}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 8,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  background: "#ddd",
                  borderRadius: 6,
                  paddingTop: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#555" }}>
                  {formatDate(photo.uploadedAt)}
                </div>
                {photo.note && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>{photo.note}</div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.path)}
                  disabled={deletingPath === photo.path}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    background: "#b00020",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 0",
                  }}
                >
                  {deletingPath === photo.path ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
