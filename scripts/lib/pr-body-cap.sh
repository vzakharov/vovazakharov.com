# The PR body cap's crossing rule, as a pure function over lengths, for
# `scripts/check-pr-body-size.sh` and its test.
#
# Meant to be SOURCED: it defines one function and sets no shell options. POSIX
# `sh` plus `awk`, so the test can call it under any shell.
#
# pr_body_cap <ceiling> <target> <current>
#   Reads the body's past lengths on stdin, one per line, in any order. The body
#   has crossed when any length, past or current, is over <ceiling>; the limit
#   is then <target>, and <ceiling> otherwise. Prints "<limit> <peak>", where
#   <peak> is the largest length seen, and returns 0 when <current> is within
#   the limit, 1 when it is over, 2 on a malformed argument or line.
pr_body_cap() {
  [ "$#" -eq 3 ] || return 2
  awk -v ceiling="$1" -v target="$2" -v current="$3" '
    function whole(s) { return s ~ /^[0-9]+$/ }
    BEGIN {
      if (!whole(ceiling) || !whole(target) || !whole(current) || target + 0 > ceiling + 0) {
        bad = 1
        exit
      }
      peak = current + 0
    }
    /^[ \t]*$/ { next }
    {
      if (!whole($1) || NF != 1) { bad = 1; exit }
      if ($1 + 0 > peak) peak = $1 + 0
    }
    END {
      if (bad) exit 2
      limit = (peak > ceiling + 0) ? target + 0 : ceiling + 0
      print limit, peak
      exit (current + 0 > limit) ? 1 : 0
    }
  '
}
