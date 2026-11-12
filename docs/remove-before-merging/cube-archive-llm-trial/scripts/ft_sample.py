"""Samples the fine-tuned model on the trial's own headers: does it pick up the format?

tmp/llm/venv/bin/python -I tmp/llm/ft_sample.py <model_dir> <prompts.json>
"""

import json
import sys

import torch
from transformers import AutoTokenizer, GPTNeoForCausalLM

model_dir, prompts = sys.argv[1], sys.argv[2]
tok = AutoTokenizer.from_pretrained(model_dir)
model = GPTNeoForCausalLM.from_pretrained(model_dir).eval()
for i, item in enumerate(json.load(open(prompts))["items"][:6]):
    torch.manual_seed(i)
    ids = tok(item["text"], return_tensors="pt").input_ids
    out = model.generate(ids, max_new_tokens=110, do_sample=True, temperature=0.8, top_k=40, repetition_penalty=1.1, pad_token_id=tok.eos_token_id)
    print(f"----- {item['seed']}")
    print(item["text"] + "█" + tok.decode(out[0][ids.shape[1]:]))
