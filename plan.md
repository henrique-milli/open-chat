# Angular 20 + Material 3 + WebLLM Chat App with Custom Model (gpt-oss-20b)

## Step-by-Step Implementation Plan

### 1. Analyze Requirements
- Build a chat UI in Angular 20 using Material 3.
- Integrate WebLLM for in-browser LLM inference.
- Use a custom model: openai/gpt-oss-20b (must be in MLC format).

### 2. Prepare the Model for WebLLM
- **Check if gpt-oss-20b is available in MLC format.**
  - If not, perform the following:
    1. Download model weights from Hugging Face.
    2. Use `mlc_llm convert_weight` to convert weights to MLC format.
       3. mlc_llm convert_weight ./path/to/original-model/ --quantization q4f16_1 -o ./output-mlc-model/
    3. Use `mlc_llm gen_config` to generate chat config and tokenizer.
       4. mlc_llm gen_config ./path/to/original-model/ --quantization q4f16_1 --conv-template <template> -o ./output-mlc-model/
    4. Use `mlc_llm compile` to build the WebGPU model library (.wasm).
       5. mlc_llm compile ./output-mlc-model/mlc-chat-config.json --device webgpu -o ./output-mlc-model/model-webgpu.wasm
    5. Upload weights and .wasm to a public location (Hugging Face, GitHub, etc.).

### 3. Set Up Angular Project
- Install Angular Material 3 and set up theming.
- Install `@mlc-ai/web-llm` via npm.

### 4. Register the Custom Model in WebLLM
- Create a ModelRecord for gpt-oss-20b:
  - `model`: URL to MLC weights
  - `model_id`: e.g. "gpt-oss-20b-MLC"
  - `model_lib`: URL to compiled .wasm
- Add this ModelRecord to a custom AppConfig.

### 5. Implement Angular Chat UI
- Create a chat component using Material 3 (mat-card, mat-form-field, mat-input, mat-button).
- Display chat history and user input.
- Show loading/progress indicators for model loading and streaming.

### 6. Integrate WebLLM in Angular
- In a service, initialize MLCEngine with custom AppConfig and model_id.
- On user message, call `engine.chat.completions.create` (with streaming if desired).
- Append responses to chat history.

### 7. Handle Model Loading and Errors
- Show progress during model loading.
- Handle errors (WebGPU not available, model load failure, etc.).

### 8. Test the Application
- Test in a WebGPU-compatible browser (latest Chrome/Edge).
- Validate chat and model responses.

### 9. Deploy the Application
- Build and deploy Angular app (e.g., GitHub Pages, Vercel, Netlify).
- Ensure model weights and library are accessible from deployed site.

### 10. Document Usage
- Add instructions for users (browser requirements, first-load time, etc.).

---

**Summary Table**

| Step | Action                                      | Code/Non-Code |
|------|---------------------------------------------|---------------|
| 1    | Analyze requirements, check model format    | Non-Code      |
| 2    | Convert/host model if needed                | Non-Code      |
| 3    | Install dependencies (web-llm, material)    | Code          |
| 4    | Register model in WebLLM AppConfig          | Code          |
| 5    | Build Angular Material chat UI              | Code          |
| 6    | Integrate WebLLM engine and chat API        | Code          |
| 7    | Handle loading/progress/errors              | Code          |
| 8    | Test in browser                             | Non-Code      |
| 9    | Deploy app and ensure model hosting         | Non-Code      |
| 10   | Document usage                              | Non-Code      |

