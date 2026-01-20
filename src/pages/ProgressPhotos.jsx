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
    return <div className="text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-muted">Please log in to manage progress photos.</div>
    );
  }

  return (
    <section className="glass-panel stack--lg">
      <div className="stack">
        <h1 className="page-heading">Progress Photos</h1>
        <p className="page-subtitle">
          Upload snapshots, jot a quick note, and watch your timeline glow over
          time.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="card stack">
        <div className="form-group">
          <label htmlFor="photo-note">Optional note</label>
          <textarea
            id="photo-note"
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Week 4 cut-in, morning lighting"
            rows={3}
            disabled={uploading}
          />
        </div>
        <div className="action-bar">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleFileClick}
            disabled={uploading}
          >
            Choose photo
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload photo"}
          </button>
          {uploading && (
            <span className="status-line text-muted">{uploadProgress}%</span>
          )}
        </div>

        {selectedFile && (
          <div className="upload-preview">
            {previewUrl && (
              <div className="upload-preview__thumb">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            <div className="upload-preview__meta">
              <div>
                <span className="text-muted">Selected:</span>{" "}
                <strong>{selectedFile.name}</strong>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearSelectedFile}
                disabled={uploading}
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {error && <div className="text-error">{error}</div>}
      </div>

      <div className="card stack">
        <h3 className="section-heading">Your timeline</h3>
        {loading ? (
          <div className="text-muted">Loading photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-muted">No photos uploaded yet.</div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <article key={photo.path} className="photo-card">
                <img
                  className="photo-card__img"
                  src={photo.url}
                  alt={photo.name}
                />
                <div className="photo-card__body">
                  <div className="photo-meta">
                    {formatDate(photo.uploadedAt)}
                  </div>
                  {photo.note && <p>{photo.note}</p>}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm btn-block"
                    onClick={() => handleDelete(photo.path)}
                    disabled={deletingPath === photo.path}
                  >
                    {deletingPath === photo.path ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
