#!/usr/bin/env python3
"""VoxArena packaging script.

Builds the React frontend and copies all built static assets and default scripts
into the voxarena package directory so they are distributed via wheel/sdist.
"""
import os
import shutil
import subprocess
import sys


def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    ui_dir = os.path.join(root_dir, "ui")
    ui_dist_target = os.path.join(root_dir, "voxarena", "ui_dist")
    default_script_target = os.path.join(root_dir, "voxarena", "default_script")

    print("Step 1: Building Frontend UI...")
    if shutil.which("npm") is None:
        print("Error: npm not found. Please install Node.js and npm.", file=sys.stderr)
        sys.exit(1)

    # Clean UI build directory first
    ui_dist_src = os.path.join(ui_dir, "dist")
    if os.path.exists(ui_dist_src):
        shutil.rmtree(ui_dist_src)

    # Install dependencies and build React UI
    subprocess.run(["npm", "install"], cwd=ui_dir, check=True)
    subprocess.run(["npm", "run", "build"], cwd=ui_dir, check=True)

    print("Step 2: Copying UI assets to python package...")
    if os.path.exists(ui_dist_target):
        shutil.rmtree(ui_dist_target)
    shutil.copytree(ui_dist_src, ui_dist_target)

    print("Step 3: Copying default script assets to python package...")
    if os.path.exists(default_script_target):
        shutil.rmtree(default_script_target)
    
    # Exclude logs or active databases in results if present
    shutil.copytree(
        os.path.join(root_dir, "script"),
        default_script_target,
        ignore=shutil.ignore_patterns("*.db", "runs.db", "*.log", "__pycache__")
    )

    print("Step 4: Building Python package distribution (wheel and sdist)...")
    subprocess.run([sys.executable, "-m", "build"], cwd=root_dir, check=True)
    print("Package built successfully!")


if __name__ == "__main__":
    main()
