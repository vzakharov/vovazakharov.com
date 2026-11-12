"""CPU fine-tuning throughput of TinyStories-8M (GPT-Neo) — the number the cost estimate scales from.

tmp/llm/venv/bin/python -I tmp/llm/ft_bench.py <model_dir> <corpus.txt> <steps> <out_dir>
Trains on <corpus.txt> (documents separated by blank-line + <|endoftext|>) and saves the result,
so a sample after N steps shows whether the format is being picked up.
"""

import sys
import time

import torch
from transformers import AutoTokenizer, GPTNeoForCausalLM

model_dir, corpus, steps, out_dir = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
torch.manual_seed(0)
torch.set_num_threads(4)
tok = AutoTokenizer.from_pretrained(model_dir)
model = GPTNeoForCausalLM.from_pretrained(model_dir)
print("params", sum(p.numel() for p in model.parameters()) / 1e6, "M")
ids = tok(open(corpus).read(), return_tensors="pt").input_ids[0]
print("corpus tokens", len(ids))
SEQ, BATCH = 256, 8
opt = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=0.01)
model.train()
t0 = time.time()
for step in range(steps):
    starts = torch.randint(0, len(ids) - SEQ - 1, (BATCH,))
    x = torch.stack([ids[s : s + SEQ] for s in starts])
    loss = model(input_ids=x, labels=x).loss
    loss.backward()
    opt.step()
    opt.zero_grad()
    if step % 20 == 0 or step == steps - 1:
        dt = time.time() - t0
        print(f"step {step} loss {loss.item():.3f}  {(step + 1) * SEQ * BATCH / dt:.0f} tok/s")
model.save_pretrained(out_dir)
tok.save_pretrained(out_dir)
