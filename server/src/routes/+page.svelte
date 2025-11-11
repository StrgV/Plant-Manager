<script lang="ts">
  let fileInput: HTMLInputElement;
  let selectedFile: File | null = null;
  let previewUrl: string | null = null;
  let uploadedImageUrl: string | null = null;
  let isUploading = false;
  let message = '';
  let messageType: 'success' | 'error' | '' = '';

  // Datei auswählen und Preview erstellen
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      selectedFile = file;
      
      // Preview erstellen
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Alte Meldungen löschen
      message = '';
      messageType = '';
      uploadedImageUrl = null;
    }
  }

  // Bild hochladen
  async function uploadImage() {
    if (!selectedFile) {
      showMessage('Bitte wähle erst ein Bild aus!', 'error');
      return;
    }

    isUploading = true;
    message = '';
    messageType = '';

    try {
      // FormData erstellen
      const formData = new FormData();
      formData.append('image', selectedFile);

      // API-Call
      const response = await fetch('/api', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(`✅ ${result.message}`, 'success');
        uploadedImageUrl = result.path;
        
        // Formular zurücksetzen
        selectedFile = null;
        previewUrl = null;
        if (fileInput) fileInput.value = '';
      } else {
        showMessage(`❌ Fehler: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      showMessage(`❌ Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`, 'error');
    } finally {
      isUploading = false;
    }
  }

  function showMessage(msg: string, type: 'success' | 'error') {
    message = msg;
    messageType = type;
  }

  function reset() {
    selectedFile = null;
    previewUrl = null;
    uploadedImageUrl = null;
    message = '';
    messageType = '';
    if (fileInput) fileInput.value = '';
  }
</script>

<div class="container">
  <h1>🌱 Plant Monitor - Image Upload Test</h1>
  
  <div class="card">
    <h2>Bild hochladen</h2>
    
    <div class="upload-section">
      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        on:change={handleFileSelect}
        disabled={isUploading}
      />
      
      {#if previewUrl}
        <div class="preview">
          <h3>Vorschau:</h3>
          <img src={previewUrl} alt="Preview" />
          <p class="file-info">
            📁 {selectedFile?.name} ({(selectedFile?.size || 0 / 1024).toFixed(2)} KB)
          </p>
        </div>
      {/if}
      
      <div class="button-group">
        <button
          on:click={uploadImage}
          disabled={!selectedFile || isUploading}
          class="btn btn-primary"
        >
          {#if isUploading}
            ⏳ Lädt hoch...
          {:else}
            📤 Hochladen
          {/if}
        </button>
        
        <button
          on:click={reset}
          disabled={isUploading}
          class="btn btn-secondary"
        >
          🔄 Zurücksetzen
        </button>
      </div>
    </div>
    
    {#if message}
      <div class="message {messageType}">
        {message}
      </div>
    {/if}
    
    {#if uploadedImageUrl}
      <div class="result">
        <h3>✅ Hochgeladenes Bild:</h3>
        <img src={uploadedImageUrl} alt="Uploaded" />
        <p class="image-path">Pfad: <code>{uploadedImageUrl}</code></p>
      </div>
    {/if}
  </div>
  
  <div class="info-card">
    <h3>ℹ️ Info</h3>
    <ul>
      <li>API-Endpoint: <code>/api</code></li>
      <li>Methode: <code>POST</code></li>
      <li>Content-Type: <code>multipart/form-data</code></li>
      <li>Field-Name: <code>image</code></li>
      <li>Upload-Ordner: <code>static/uploads/</code></li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  h1 {
    color: #2d5016;
    text-align: center;
    margin-bottom: 2rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .info-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border-left: 4px solid #2d5016;
  }

  .info-card h3 {
    margin-top: 0;
    color: #2d5016;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-card li {
    margin: 0.5rem 0;
  }

  .info-card code {
    background: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9em;
  }

  h2 {
    margin-top: 0;
    color: #333;
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  input[type="file"] {
    padding: 0.75rem;
    border: 2px dashed #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s;
  }

  input[type="file"]:hover:not(:disabled) {
    border-color: #2d5016;
  }

  input[type="file"]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview, .result {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background: #f9f9f9;
  }

  .preview h3, .result h3 {
    margin-top: 0;
    color: #555;
  }

  .preview img, .result img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .file-info {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 0.9em;
  }

  .image-path {
    margin: 0.5rem 0 0 0;
    color: #666;
    word-break: break-all;
  }

  .image-path code {
    background: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #2d5016;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #3d6b1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(45, 80, 22, 0.3);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
  }

  .message {
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    font-weight: 500;
  }

  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  @media (max-width: 600px) {
    .container {
      padding: 1rem;
    }

    .card {
      padding: 1.5rem;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>