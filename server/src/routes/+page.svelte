<script lang="ts">
	let file: File | null = null;
	let responseMessage = '';
	let uploadedPath = '';

	async function handleUpload() {
		if (!file) {
			responseMessage = 'Bitte zuerst eine Datei wählen';
			return;
		}

		const formData = new FormData();
		formData.append('image', file);

		try {
			const res = await fetch('/api', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			responseMessage = data.message;

			if (res.ok && data.path) {
				uploadedPath = data.path;
			}
		} catch (err) {
			responseMessage = 'Fehler beim Senden: ' + err;
		}
	}
</script>

<h1>Datei‑Upload testen</h1>
<input type="file" on:change={(e) => (file = e.target.files?.[0] ?? null)} />
<button on:click={handleUpload}>Hochladen</button>

<p>{responseMessage}</p>
{#if uploadedPath}
	<p>Bildpfad: {uploadedPath}</p>
	<img src={uploadedPath} alt="Hochgeladenes Bild" style="max-width: 200px;" />
{/if}
