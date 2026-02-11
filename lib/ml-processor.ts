import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface CustomMLPrediction {
    prediction: 'FAKE' | 'REAL';
    confidence: number;
    available: boolean;
}

const MODEL_PATH = path.join(process.cwd(), 'public', 'models', 'fake_news_model.pkl');
const PYTHON_SCRIPT = path.join(process.cwd(), 'ml', 'predict.py');

/**
 * Check if model is available
 */
function isModelAvailable(): boolean {
    return fs.existsSync(MODEL_PATH) && fs.existsSync(PYTHON_SCRIPT);
}

/**
 * Predict using the custom ML model via Python subprocess
 */
export async function predictWithCustomML(text: string): Promise<CustomMLPrediction> {
    if (!isModelAvailable()) {
        return {
            prediction: 'FAKE',
            confidence: 0,
            available: false
        };
    }

    return new Promise((resolve) => {
        // Sanitize text for JSON
        const sanitizedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').slice(0, 3000);

        const python = spawn('python', [PYTHON_SCRIPT, sanitizedText], {
            cwd: process.cwd()
        });

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ Python ML prediction failed:', errorOutput);
                resolve({
                    prediction: 'FAKE',
                    confidence: 0,
                    available: false
                });
                return;
            }

            try {
                const result = JSON.parse(output.trim());
                resolve({
                    prediction: result.prediction === 1 ? 'REAL' : 'FAKE',
                    confidence: Math.round(result.confidence * 100),
                    available: true
                });
            } catch (error) {
                console.error('❌ Failed to parse ML output:', output);
                resolve({
                    prediction: 'FAKE',
                    confidence: 0,
                    available: false
                });
            }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
            python.kill();
            resolve({
                prediction: 'FAKE',
                confidence: 0,
                available: false
            });
        }, 5000);
    });
}