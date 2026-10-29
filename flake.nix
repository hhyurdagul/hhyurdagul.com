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

      apps = forAllSystems (pkgs: {
        # `nix run .#og-cards` → the site's social-preview card.
        og-cards = {
          type = "app";
          program = toString (pkgs.writeShellScript "og-cards" ''
            set -euo pipefail
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            exec ${pkgs.python3.withPackages (ps: [ ps.playwright ])}/bin/python3 scripts/og-cards.py
          '');
        };
      });
    };
}
