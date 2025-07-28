# inference.py
import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

def model_fn(model_dir):
    """
    Load base model + apply LoRA adapter.
    """
    # 1) Load tokenizer & base model from HF Hub
    tokenizer = AutoTokenizer.from_pretrained("huggyllama/llama-7b", use_fast=False)
    base_model = AutoModelForCausalLM.from_pretrained(
        "huggyllama/llama-7b",
        load_in_8bit=True,
        device_map="auto"
    )

    # 2) Load LoRA adapter from model_dir
    model = PeftModel.from_pretrained(base_model, model_dir, device_map="auto")
    model.eval()

    return {"model": model, "tokenizer": tokenizer}

def input_fn(request_body, request_content_type):
    """
    Deserialize the JSON request.
    Expect {"inputs": "<prompt>", "parameters": {...}}
    """
    if request_content_type == "application/json":
        data = json.loads(request_body)
        prompt = data.get("inputs") or data.get("prompt")
        params = data.get("parameters", {})
        return prompt, params
    raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model_and_tokenizer):
    """
    Run generation with the loaded model.
    """
    prompt, params = input_data
    tokenizer = model_and_tokenizer["tokenizer"]
    model = model_and_tokenizer["model"]

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    gen_kwargs = {
        "max_new_tokens": params.get("max_new_tokens", 100),
        "temperature": params.get("temperature", 1.0),
        "top_p": params.get("top_p", 1.0),
        "do_sample": params.get("do_sample", True),
    }
    with torch.no_grad():
        output_ids = model.generate(**inputs, **gen_kwargs)
    text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return text

def output_fn(prediction, response_content_type):
    """
    Serialize the generated text to JSON.
    """
    if response_content_type == "application/json":
        return json.dumps({"generated_text": prediction}), "application/json"
    return prediction, "text/plain"
