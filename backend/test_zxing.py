#!/usr/bin/env python3
"""
Simple test script to verify ZXing CLI integration
"""

import subprocess
import sys

def test_zxing_installation():
    """Test if ZXing CLI is installed and working"""
    try:
        result = subprocess.run(['zxing', '--help'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ ZXing CLI is installed and working")
            return True
        else:
            print("❌ ZXing CLI is installed but not working properly")
            print(f"Error: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ ZXing CLI is not installed or not in PATH")
        return False
    except subprocess.TimeoutExpired:
        print("❌ ZXing CLI timeout")
        return False
    except Exception as e:
        print(f"❌ Error testing ZXing CLI: {e}")
        return False

def test_flask_imports():
    """Test if all required Flask app imports work"""
    try:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
        import cv2
        import numpy as np
        import base64
        import subprocess
        import tempfile
        import os
        print("✅ All Python dependencies are available")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        return False

if __name__ == "__main__":
    print("Testing ZXing CLI and Flask dependencies...")
    print("-" * 50)
    
    tests_passed = 0
    total_tests = 2
    
    if test_zxing_installation():
        tests_passed += 1
    
    if test_flask_imports():
        tests_passed += 1
    
    print("-" * 50)
    print(f"Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! The app should work correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the installation.")
        sys.exit(1) 