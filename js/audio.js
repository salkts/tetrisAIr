/**
 * NES-Style Tetris - Audio Manager
 * This file handles all audio-related functionality using the Web Audio API
 */

class AudioManager {
    constructor() {
        // Initialize audio context
        this.audioContext = null;
        this.musicSource = null;
        this.musicBuffer = null;
        this.musicGainNode = null;
        this.musicVolume = 0.5; // Default volume (0.0 to 1.0)
        this.isMusicEnabled = true;
        this.isMusicPlaying = false;
        this.isMusicLoaded = false;
        this.musicStartTime = 0;
        this.musicPauseTime = 0;
        
        // Initialize audio context when possible (on user interaction)
        this.initializeAudioContext();
    }
    
    /**
     * Initialize the Web Audio API context
     */
    initializeAudioContext() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create gain node for volume control
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = this.musicVolume;
            this.musicGainNode.connect(this.audioContext.destination);
            
            console.log('Audio context initialized successfully');
            
            // Load the background music
            this.loadBackgroundMusic();
        } catch (error) {
            console.error('Web Audio API is not supported in this browser:', error);
        }
    }
    
    /**
     * Load the background music file
     */
    loadBackgroundMusic() {
        const musicPath = 'audio/music/Original Tetris theme (Tetris Soundtrack).mp3';
        
        fetch(musicPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.musicBuffer = audioBuffer;
                this.isMusicLoaded = true;
                console.log('Background music loaded successfully');
            })
            .catch(error => {
                console.error('Error loading background music:', error);
            });
    }
    
    /**
     * Play the background music
     */
    async playMusic() {
        if (!this.audioContext || !this.isMusicLoaded || !this.isMusicEnabled) {
            return;
        }
        
        // If the audio context is suspended (browser policy), resume it
        if (this.audioContext.state === 'suspended') {
            try {
                console.log('Audio context suspended, attempting to resume...');
                await this.audioContext.resume(); // Wait for resume to complete
                console.log('Audio context resumed successfully.');
            } catch (err) {
                console.error('Failed to resume audio context:', err);
                return; // Exit if we can't resume
            }
        }
        
        // If music is already playing, don't start it again
        if (this.isMusicPlaying) {
            return;
        }
        
        // Create a new source node
        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.musicBuffer;
        this.musicSource.loop = true;
        
        // Connect the source to the gain node
        this.musicSource.connect(this.musicGainNode);
        
        // If resuming from pause, calculate the offset
        let offset = 0;
        if (this.musicPauseTime > 0) {
            offset = this.musicPauseTime;
        }
        
        // Start playback
        this.musicSource.start(0, offset);
        this.musicStartTime = this.audioContext.currentTime - offset;
        this.isMusicPlaying = true;
        this.musicPauseTime = 0;
        
        console.log('Background music started');
    }
    
    /**
     * Pause the background music
     */
    pauseMusic() {
        if (!this.audioContext || !this.musicSource || !this.isMusicPlaying) {
            return;
        }
        
        // Calculate the current playback position
        this.musicPauseTime = (this.audioContext.currentTime - this.musicStartTime) % this.musicBuffer.duration;
        
        // Stop the current source
        this.musicSource.stop();
        this.musicSource = null;
        this.isMusicPlaying = false;
        
        console.log('Background music paused');
    }
    
    /**
     * Stop the background music completely
     */
    stopMusic() {
        if (!this.audioContext || !this.musicSource) {
            return;
        }
        
        // Stop the current source
        this.musicSource.stop();
        this.musicSource = null;
        this.isMusicPlaying = false;
        this.musicPauseTime = 0;
        
        console.log('Background music stopped');
    }
    
    /**
     * Set the music volume
     * @param {number} volume - Volume level from 0.0 to 1.0
     */
    setMusicVolume(volume) {
        if (!this.audioContext || !this.musicGainNode) {
            return;
        }
        
        // Clamp volume between 0 and 1
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Apply volume to gain node using an exponential curve for better perceived volume control
        // This provides a more natural volume increase, especially in the higher ranges
        this.musicGainNode.gain.value = this.musicVolume * this.musicVolume;
        
        console.log(`Music volume set to ${this.musicVolume} (gain: ${this.musicGainNode.gain.value})`);
    }
    
    /**
     * Enable or disable music
     * @param {boolean} enabled - Whether music should be enabled
     */
    setMusicEnabled(enabled) {
        this.isMusicEnabled = enabled;
        
        if (enabled && !this.isMusicPlaying) {
            this.playMusic();
        } else if (!enabled && this.isMusicPlaying) {
            this.pauseMusic();
        }
        
        console.log(`Music ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Clean up resources when the audio manager is destroyed
     */
    cleanup() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isMusicPlaying = false;
        this.isMusicLoaded = false;
    }
}
