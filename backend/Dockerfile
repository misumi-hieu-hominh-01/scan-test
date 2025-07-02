FROM ubuntu:22.04

# --- Step 1: Install dependencies ---
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    libopencv-dev \
    python3.10 \
    python3-pip \
    python3.10-venv \
    && rm -rf /var/lib/apt/lists/*

# --- Step 2: Download pre-built ZXing binary ---
WORKDIR /tmp

# Download pre-built ZXing binary (if available) or use alternative method
RUN wget -O zxing-cli.zip https://github.com/zxing-cpp/zxing-cpp/releases/download/v2.2.1/zxing-cpp-2.2.1-linux-x86_64.zip || \
    (echo "Pre-built binary not available, will use alternative method" && \
     apt-get update && apt-get install -y build-essential cmake git && \
     git clone --depth 1 https://github.com/zxing-cpp/zxing-cpp.git && \
     cd zxing-cpp && mkdir build && cd build && \
     cmake .. -DBUILD_EXAMPLES=ON -DCMAKE_BUILD_TYPE=Release && \
     make -j2 && cp zxing /usr/local/bin/)

# Extract and install if zip download was successful
RUN if [ -f "zxing-cli.zip" ]; then \
        unzip zxing-cli.zip && \
        find . -name "zxing" -type f -executable -exec cp {} /usr/local/bin/ \; && \
        chmod +x /usr/local/bin/zxing; \
    fi

# Verify ZXing installation
RUN which zxing && zxing --help

# --- Step 3: Setup Python App ---
WORKDIR /app

COPY . /app

RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

# Expose the port
EXPOSE 5002

# --- Step 4: Run app ---
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5002} app:app"] 