FROM ubuntu:22.04

# --- Step 1: Install dependencies ---
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    unzip \
    libopencv-dev \
    python3.10 \
    python3-pip \
    python3.10-venv \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# --- Step 2: Install ZXing-C++ CLI ---
WORKDIR /opt

# Clone the official ZXing-C++ repository
RUN git clone --depth 1 https://github.com/zxing-cpp/zxing-cpp.git

# Build ZXing-C++ with examples enabled
WORKDIR /opt/zxing-cpp/build
RUN cmake .. \
    -DBUILD_EXAMPLES=ON \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_BUILD_TYPE=Release \
    -DZXING_BUILD_EXAMPLES=ON && \
    make -j$(nproc)

# Copy the built executables to system path
RUN if [ -f example/ZXingReader ]; then \
        cp example/ZXingReader /usr/local/bin/zxing && \
        chmod +x /usr/local/bin/zxing && \
        echo "ZXingReader copied as zxing"; \
    else \
        echo "ERROR: ZXingReader not found" && \
        find . -name "*" -type f -executable && \
        exit 1; \
    fi

# Test the ZXing installation
RUN zxing --help || echo "ZXing CLI installed but help not available"

# --- Step 3: Setup Python App ---
WORKDIR /app

COPY . /app

RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

# Expose the port
EXPOSE 5002

# --- Step 4: Run app ---
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5002} app:app"] 