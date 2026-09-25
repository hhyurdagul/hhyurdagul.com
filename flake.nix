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
        diagrams = {
          type = "app";
          program = toString (pkgs.writeShellScript "render-diagrams" ''
            set -euo pipefail
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
