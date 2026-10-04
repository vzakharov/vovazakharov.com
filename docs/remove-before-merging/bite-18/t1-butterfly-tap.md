# t1-butterfly-tap — hand-over

**Done.** The `meadow` play's five butterfly-4 lines on tabL were the
harness's: `waitInReach` picked butterfly-4 drinking at flower-20, which had
sunk under the brow (`drawnInsect` gives no pose, so its container is hidden
and takes no tap), while `__probe.insect` still reported its last drawn
place, (933, 501), where flower-9's head is the only thing that answers a
tap. `waitInReach` now offers its picker only the insects in sight
(`inSight`, as `play-buzzers.ts` already filters). The game is right: a
butterfly hidden under the brow takes no tap.

**Left.** The same run then goes red on one line the change only exposes,
by shifting the run's timing: `fly-8 (fly) turned 36.42 rad/s … past its
kind's 36.36` — a game-side turn-rate overshoot of 0.2 %, not looked into
here.
