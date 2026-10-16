# Save the Humans!

Zombies have attacked the zoo!  The visitors are panicking, and it is up to the
zoo animals to save.

"Save the Humans!" is a lightweight browser-based single-player game.  The goal
is to save as many people as possible before they are turned into zombies.  The
map is a zoo with paths winding around obstacles.  The player controls two
animals (one using their left hand on WASD keys, the other using their right on
IJKL keys).  Each animal has different abilities.  For example, the tiger is
scary, so people will run away from it when it approaches.  However, if it gets
too close, they might be so scared that they run straight into a zombie.  The
bunny is so cute that people will chase after it.  If they catch it, though,
they will stop to pet it, which means the zombies might catch up with them.

## Running

The game is a static site with no build step. It loads KAPLAY from a CDN and
uses ES modules, so it must be served over HTTP rather than opened directly
from the filesystem.

From the project root, run:

    python3 -m http.server 8000

then open <http://localhost:8000> in a browser. Reload the page to generate a
new map.
