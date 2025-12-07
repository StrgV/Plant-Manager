<script lang="ts">
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;
	let previewUrl: string | null = null;
	let uploadedImageUrl: string | null = null;
	let isUploading = false;
	let message = '';
	let messageType: 'success' | 'error' | '' = '';

	// Neu: Test-Bild Generator
	let isGenerating = false;
	let generatedCount = 0;
	let totalToGenerate = 30;

	// Neu: Zeitraffer
	let isCreatingTimelapse = false;
	let timelapseUrl: string | null = null;

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
			showMessage(
				`❌ Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
				'error'
			);
		} finally {
			isUploading = false;
		}
	}

	// NEU: Test-Bilder generieren (im Browser mit Canvas)
	async function generateTestImages() {
		isGenerating = true;
		generatedCount = 0;
		message = '';
		messageType = '';
		timelapseUrl = null;

		try {
			const colors = [
				{ r: 255, g: 107, b: 107 }, // Rot
				{ r: 78, g: 205, b: 196 }, // Türkis
				{ r: 69, g: 183, b: 209 }, // Blau
				{ r: 150, g: 206, b: 180 }, // Grün
				{ r: 255, g: 234, b: 167 }, // Gelb
				{ r: 223, g: 230, b: 233 }, // Grau
				{ r: 116, g: 185, b: 255 }, // Hellblau
				{ r: 162, g: 155, b: 254 }, // Lila
				{ r: 253, g: 121, b: 168 }, // Pink
				{ r: 253, g: 203, b: 110 } // Orange
			];

			for (let i = 0; i < totalToGenerate; i++) {
				const color = colors[i % colors.length];
				const timestamp = Date.now() - (totalToGenerate - i) * 2 * 60 * 1000;
				const time = new Date(timestamp).toLocaleTimeString('de-DE');

				// Bild im Browser erstellen
				const blob = await createTestImage(
					`Test-Bild ${i + 1}\n${time}`,
					`rgb(${color.r}, ${color.g}, ${color.b})`
				);

				// Als File umwandeln
				const file = new File([blob], `${timestamp}.jpg`, { type: 'image/jpeg' });

				// Hochladen
				const formData = new FormData();
				formData.append('image', file);

				const response = await fetch('/api', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`Upload fehlgeschlagen für Bild ${i + 1}`);
				}

				generatedCount = i + 1;

				// Kleine Pause, um Server nicht zu überlasten
				await new Promise((resolve) => setTimeout(resolve, 1100));
			}

			showMessage(`✅ ${totalToGenerate} Test-Bilder erfolgreich hochgeladen!`, 'success');
		} catch (error) {
			console.error('Fehler beim Generieren:', error);
			showMessage(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`, 'error');
		} finally {
			isGenerating = false;
		}
	}

	// Hilfsfunktion: Test-Bild mit Canvas erstellen
	async function createTestImage(text: string, color: string): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement('canvas');
			// QUERFORMAT: 1920x1080
			canvas.width = 1920;
			canvas.height = 1080;
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				reject(new Error('Canvas nicht verfügbar'));
				return;
			}

			// Hintergrund
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Text
			ctx.fillStyle = 'white';
			ctx.font = 'bold 60px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			const lines = text.split('\n');
			lines.forEach((line, index) => {
				ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index - 0.5) * 80);
			});

			// Als Blob exportieren
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error('Blob-Erstellung fehlgeschlagen'));
					}
				},
				'image/jpeg',
				0.9
			);
		});
	}

	// NEU: Zeitraffer erstellen
	async function createTimelapse() {
		isCreatingTimelapse = true;
		message = '';
		messageType = '';
		timelapseUrl = null;

		try {
			const response = await fetch('/api/timelapse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ action: 'create_timelapse' })
			});

			const result = await response.json();

			if (response.ok) {
				showMessage(`✅ ${result.message}`, 'success');
				timelapseUrl = result.videoPath;
			} else {
				showMessage(`❌ Fehler: ${result.message}`, 'error');
			}
		} catch (error) {
			console.error('Zeitraffer-Fehler:', error);
			showMessage(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`, 'error');
		} finally {
			isCreatingTimelapse = false;
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
	<h1>🌱 Plant Monitor - Test Interface</h1>

	<!-- NEU: Test-Bilder Generator -->
	<div class="card test-card">
		<h2>🧪 Test-Modus</h2>
		<p>Generiere automatisch Test-Bilder für den Zeitraffer</p>

		<div class="test-section">
			<div class="input-group">
				<label for="imageCount">Anzahl Bilder:</label>
				<input
					id="imageCount"
					type="number"
					bind:value={totalToGenerate}
					min="10"
					max="100"
					disabled={isGenerating}
				/>
			</div>

			<button on:click={generateTestImages} disabled={isGenerating} class="btn btn-warning">
				{#if isGenerating}
					⏳ Generiere... ({generatedCount}/{totalToGenerate})
				{:else}
					🎨 Test-Bilder generieren
				{/if}
			</button>

			{#if generatedCount > 0 && !isGenerating}
				<button on:click={createTimelapse} disabled={isCreatingTimelapse} class="btn btn-success">
					{#if isCreatingTimelapse}
						⏳ Erstelle Video...
					{:else}
						🎬 Zeitraffer erstellen
					{/if}
				</button>
			{/if}
		</div>

		{#if timelapseUrl}
			<div class="video-result">
				<h3>✅ Zeitraffer-Video:</h3>
				<video controls width="100%" style="max-width: 400px;">
					<source src={timelapseUrl} type="video/mp4" />
				</video>
				<p><a href={timelapseUrl} download>📥 Video herunterladen</a></p>
			</div>
		{/if}
	</div>
	<div class="card admin-card">
		<h2>🚀 Live-Steuerung (Echte Bilder)</h2>
		<p>
			Hier kannst du den täglichen Prozess manuell starten. <br />
			<strong>Achtung:</strong> Dies verarbeitet alle echten Bilder von heute, lädt das Video hoch
			und
			<strong>löscht danach die Bilder</strong> (genau wie der echte Scheduler).
		</p>

		<button on:click={createTimelapse} disabled={isCreatingTimelapse} class="btn btn-primary">
			{#if isCreatingTimelapse}
				⏳ Verarbeite echte Bilder & Upload...
			{:else}
				▶️ Tages-Prozess jetzt starten
			{/if}
		</button>

		{#if timelapseUrl && generatedCount === 0}
			<div class="video-result">
				<h3>✅ Live-Zeitraffer fertig:</h3>
				<video controls width="100%" style="max-width: 400px;">
					<source src={timelapseUrl} type="video/mp4" />
				</video>
				<p>
					<a href={timelapseUrl} download>📥 Video herunterladen</a> <br />
					<small>(Checke deinen YouTube Kanal für den Upload!)</small>
				</p>
			</div>
		{/if}
	</div>
	<div class="card">
		<h2>📤 Manueller Upload</h2>

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

				<button on:click={reset} disabled={isUploading} class="btn btn-secondary">
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
			<li>Upload-API: <code>/api</code></li>
			<li>Zeitraffer-API: <code>/api/timelapse</code></li>
			<li>Video-Format: 1920x1080 (16:9 Querformat)</li>
			<li>Max. Länge: 59 Sekunden @ 30fps</li>
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
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

	.test-card {
		background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
		border: 2px solid #ffd700;
	}

	.test-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.input-group label {
		font-weight: 600;
		color: #333;
	}

	.input-group input[type='number'] {
		padding: 0.5rem;
		border: 2px solid #ddd;
		border-radius: 6px;
		width: 100px;
		font-size: 1rem;
	}

	.video-result {
		margin-top: 1.5rem;
		padding: 1rem;
		background: #f0f0f0;
		border-radius: 8px;
	}

	.video-result h3 {
		margin-top: 0;
		color: #2d5016;
	}

	.video-result a {
		color: #2d5016;
		font-weight: 600;
		text-decoration: none;
	}

	.video-result a:hover {
		text-decoration: underline;
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

	input[type='file'] {
		padding: 0.75rem;
		border: 2px dashed #ccc;
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.3s;
	}

	input[type='file']:hover:not(:disabled) {
		border-color: #2d5016;
	}

	input[type='file']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.preview,
	.result {
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		padding: 1rem;
		background: #f9f9f9;
	}

	.preview h3,
	.result h3 {
		margin-top: 0;
		color: #555;
	}

	.preview img,
	.result img {
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

	.btn-warning {
		background: #ffc107;
		color: #333;
	}

	.btn-warning:hover:not(:disabled) {
		background: #e0a800;
		transform: translateY(-2px);
	}

	.btn-success {
		background: #28a745;
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		background: #218838;
		transform: translateY(-2px);
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