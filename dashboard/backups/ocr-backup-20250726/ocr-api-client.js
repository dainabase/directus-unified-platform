/**
 * OCR API Client
 * Client JavaScript pour communiquer avec le backend OCR/Notion
 */

class OCRAPIClient {
    constructor(baseURL = 'http://localhost:3001/api') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Upload and process a document
     */
    async uploadDocument(file, onProgress = null) {
        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await fetch(`${this.baseURL}/ocr/upload`, {
                method: 'POST',
                body: formData,
                // Note: Don't set Content-Type header for FormData
                headers: {}
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    /**
     * Analyze text without file upload
     */
    async analyzeText(text, documentType = null) {
        try {
            const response = await fetch(`${this.baseURL}/ocr/analyze`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify({
                    text,
                    documentType
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Analysis failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    /**
     * Save document to Notion
     */
    async saveToNotion(documentType, extractedData, fileId = null) {
        try {
            const response = await fetch(`${this.baseURL}/ocr/save-to-notion`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify({
                    fileId,
                    documentType,
                    extractedData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                
                // Handle duplicate document
                if (response.status === 409) {
                    return {
                        success: false,
                        isDuplicate: true,
                        ...error
                    };
                }
                
                throw new Error(error.message || 'Save to Notion failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Save to Notion error:', error);
            throw error;
        }
    }

    /**
     * Batch upload multiple documents
     */
    async uploadBatch(files, onProgress = null) {
        try {
            const formData = new FormData();
            
            files.forEach(file => {
                formData.append('documents', file);
            });

            const response = await fetch(`${this.baseURL}/ocr/batch`, {
                method: 'POST',
                body: formData,
                headers: {}
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Batch upload failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Batch upload error:', error);
            throw error;
        }
    }

    /**
     * Get processing status
     */
    async getStatus(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/ocr/status/${fileId}`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Status check failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/ocr/file/${fileId}`, {
                method: 'DELETE',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Delete failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    /**
     * Get configured Notion databases
     */
    async getNotionDatabases() {
        try {
            const response = await fetch(`${this.baseURL}/notion/databases`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get databases');
            }

            return await response.json();

        } catch (error) {
            console.error('Get databases error:', error);
            throw error;
        }
    }

    /**
     * Search document in Notion
     */
    async searchNotionDocument(documentType, query) {
        try {
            const response = await fetch(`${this.baseURL}/notion/search`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify({
                    documentType,
                    query
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Search failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    /**
     * Update Notion page
     */
    async updateNotionPage(pageId, properties) {
        try {
            const response = await fetch(`${this.baseURL}/notion/page/${pageId}`, {
                method: 'PUT',
                headers: this.defaultHeaders,
                body: JSON.stringify({
                    properties
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Update failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health/detailed`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error('Health check failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Health check error:', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Test all services
     */
    async testServices() {
        try {
            const response = await fetch(`${this.baseURL}/health/test-services`, {
                method: 'POST',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error('Service test failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Service test error:', error);
            throw error;
        }
    }
}

// Export for use
window.OCRAPIClient = OCRAPIClient;