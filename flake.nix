{
  description = "hhyurdagul.com — Zola site";

  # Stable channel: zola 0.22.x. Zola 0.23 moves to a new template engine
  # (Tera 2) and needs a template migration before bumping.
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      # `nix develop` → zola serve / zola check / zola build
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell { packages = [ pkgs.zola ]; };
      });

      # `nix run .#diagrams` → render diagrams/*.mmd to style-free SVGs that
      # the site's CSS themes (light/dark). Kept out of the dev shell because
      # mermaid-cli pulls in a headless Chromium.
      apps = forAllSystems (pkgs: {
        # `nix run .#og-cards` → social-preview cards for the site and every
        # article (static/assets/og.png, static/og/<slug>.png).
        og-cards = {
          type = "app";
          program = toString (pkgs.writeShellScript "og-cards" ''
            set -euo pipefail
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            exec ${pkgs.python3.withPackages (ps: [ ps.playwright ])}/bin/python3 scripts/og-cards.py
          '');
        };

        diagrams = {
          type = "app";
          program = toString (pkgs.writeShellScript "render-diagrams" ''
            set -euo pipefail
            # Measure labels with the site's interface font (Inter), so the
            # layout fits the text the browser actually draws.
            export FONTCONFIG_FILE=${pkgs.makeFontsConf { fontDirectories = [ pkgs.inter ]; }}
            cd diagrams
            for src in *.mmd; do
              name="''${src%.mmd}"
              ${pkgs.mermaid-cli}/bin/mmdc -q -i "$src" -o "$name.svg" \
                -c mermaid.json -b transparent -I "$name-diagram"
              # Drop mermaid's embedded <style> and layout metadata; the
              # site stylesheet (.diagram) owns colors and fonts.
              ${pkgs.perl}/bin/perl -0pi -e \
                's/<style>.*?<\/style>//s; s/ data-points="[^"]*"//g; s/ style=""//g' \
                "$name.svg"
              echo "rendered $name.svg"
            done
          '');
        };
      });
    };
}
