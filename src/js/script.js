// Update the convertBtn click handler:
convertBtn.addEventListener('click', async function() {
    const youtubeUrl = youtubeUrlInput.value.trim();
    
    if (!youtubeUrl) {
        alert('Please enter a YouTube URL');
        return;
    }
    
    if (!isValidYouTubeUrl(youtubeUrl)) {
        alert('Please enter a valid YouTube URL');
        return;
    }
    
    // Show loading state
    resultSection.style.display = 'block';
    loadingSection.style.display = 'block';
    downloadSection.style.display = 'none';
    
    try {
        // Call Netlify function
        const response = await fetch(`/.netlify/functions/convert?url=${encodeURIComponent(youtubeUrl)}&format=${currentFormat}&quality=${currentQuality}`);
        
        if (!response.ok) {
            throw new Error('Failed to get video info');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Display results
        displayResults(data.info, data.downloadUrl, data.title);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to process video. Please try again.');
        hideLoading();
    }
});

// Update displayResults function:
function displayResults(videoInfo, downloadUrl, filename) {
    hideLoading();
    
    // Set video info
    const videoId = extractVideoId(downloadUrl);
    if (videoId) {
        videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    videoTitle.textContent = videoInfo.title;
    videoDuration.textContent = `Duration: ${formatDuration(videoInfo.duration)}`;
    
    // Set download link
    downloadBtn.href = downloadUrl;
    downloadBtn.setAttribute('download', filename);
    downloadBtn.onclick = null; // Remove any previous handlers
    
    // Show download section
    downloadSection.style.display = 'flex';
}