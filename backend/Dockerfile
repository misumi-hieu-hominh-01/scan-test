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

RUN git clone --depth 1 https://github.com/zxing-cpp/zxing-cpp.git
RUN mkdir zxing-cpp/build && cd zxing-cpp/build && \
    cmake .. -DBUILD_EXAMPLES=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc) && \
    cp zxing /usr/local/bin/

# --- Step 3: Setup Python App ---
WORKDIR /app

COPY . /app

RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

# Expose the port
EXPOSE 5002

# --- Step 4: Run app ---
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5002} app:app"] 