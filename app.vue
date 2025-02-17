<template>
  <div class="min-h-screen bg-black text-white font-sans antialiased">
    <div class="container mx-auto px-4 py-24 max-w-2xl">
      <h1 class="text-5xl font-extrabold mb-2 text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Get Your Coupon</h1>
      <p class="text-center text-gray-500 mb-12">Upload an image to receive your unique coupon code</p>
      
      <div class="bg-[#111111] rounded-xl p-6 border border-[#333333]">
        <div class="space-y-6">
          <!-- Image Preview -->
          <div v-if="imagePreview" class="relative w-full aspect-video rounded-xl overflow-hidden border border-[#333333]">
            <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
            <button 
              @click="clearImage" 
              class="absolute top-3 right-3 bg-black/80 p-2 rounded-lg hover:bg-black transition-colors border border-[#333333]"
              aria-label="Remove image"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Upload Area -->
          <div 
            v-else
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'border border-dashed rounded-xl p-8 text-center transition-all duration-200',
              isDragging ? 'border-white bg-[#222222] border-2' : 'border-[#333333] hover:border-white/50'
            ]"
          >
            <input 
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              class="hidden"
            />
            <button 
              @click="$refs.fileInput.click()"
              class="w-full space-y-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="mx-auto w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <span class="block text-sm font-medium mb-1">Drop your image here</span>
                <span class="text-xs text-gray-500">or click to upload</span>
              </div>
            </button>
          </div>

          <!-- Analysis Button -->
          <button 
            @click="analyzeImage"
            :disabled="!imagePreview || loading"
            class="w-full h-10 bg-white text-black rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm relative overflow-hidden group"
          >
            <span :class="['absolute inset-0 flex items-center justify-center transition-opacity duration-200',
              loading ? 'opacity-100' : 'opacity-0']">
              <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span :class="['absolute inset-0 flex items-center justify-center transition-opacity duration-200',
              loading ? 'opacity-0' : 'opacity-100']">
              Analyze Image
            </span>
          </button>

          <!-- Result -->
          <div v-if="result" :class="[
            'p-4 rounded-lg border transition-colors duration-200',
            result.success ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'
          ]">
            <p v-if="result.success" class="text-center space-y-2">
              <span class="block text-xs text-gray-400">Your coupon code:</span>
              <span class="font-mono text-lg font-bold tracking-wide">{{ result.coupon }}</span>
            </p>
            <p v-else class="text-center text-sm text-red-400">
              {{ result.message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const fileInput = ref(null);
const imagePreview = ref(null);
const loading = ref(false);
const result = ref(null);
const isDragging = ref(false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    createImagePreview(file);
  }
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    createImagePreview(file);
  }
}

function createImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    result.value = null;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  imagePreview.value = null;
  result.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function analyzeImage() {
  if (!imagePreview.value) return;
  
  loading.value = true;
  result.value = null;
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imagePreview.value
      })
    });
    
    result.value = await response.json();
  } catch (error) {
    result.value = {
      success: false,
      message: 'An error occurred. Please try again.'
    };
  } finally {
    loading.value = false;
  }
}
</script>