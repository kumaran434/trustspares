
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Send, Image as ImageIcon, X, Trash2, Plus, Download, Palette, Type, LayoutTemplate, Layers, Maximize2, Minimize2, Columns, Rows, AlertTriangle } from 'lucide-react';
import SEO from '../../components/SEO';

const THEMES = [
    { id: 'classic', bg: '#000000', text: '#ffffff', accent: '#FACC15' }, // Black/Gold
    { id: 'modern', bg: '#ffffff', text: '#1e293b', accent: '#2563EB' },  // White/Blue
    { id: 'bold', bg: '#dc2626', text: '#ffffff', accent: '#ffffff' },    // Red/White
    { id: 'royal', bg: '#4c1d95', text: '#ffffff', accent: '#fbbf24' },   // Purple/Gold
    { id: 'nature', bg: '#166534', text: '#ffffff', accent: '#86efac' },  // Green/LightGreen
    { id: 'slate', bg: '#334155', text: '#ffffff', accent: '#38bdf8' },   // Slate/Sky
];

const PostMaker: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Image Cache to prevent flickering
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // State
  const [images, setImages] = useState<string[]>([]);
  
  // Content State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.name || 'MY SHOP');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  
  // Style State
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [layoutMode, setLayoutMode] = useState<'SPLIT' | 'OVERLAY'>('SPLIT');
  const [imageFit, setImageFit] = useState<'CONTAIN' | 'COVER'>('CONTAIN'); // Default to CONTAIN (Fit)
  const [gridType, setGridType] = useState<'COLS' | 'ROWS'>('COLS'); // For 2 images: Vertical vs Horizontal split

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
      // Check if the app was restarted by the OS while taking a photo
      if (sessionStorage.getItem('camera_opened_postmaker') === 'true') {
          sessionStorage.removeItem('camera_opened_postmaker');
          setImageError("Your phone restarted the app to save memory while taking the photo. Please use the 'Gallery' option instead.");
      }
  }, []);

  // --- Image Handling ---
  const processFiles = (files: FileList | null) => {
      sessionStorage.removeItem('camera_opened_postmaker');
      if (!files) return;
      
      Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target?.result) {
                  // Limit to 4 images max for the collage
                  setImages(prev => {
                      if (prev.length >= 4) return prev;
                      return [...prev, e.target!.result as string];
                  });
              }
          };
          reader.readAsDataURL(file);
      });
  };

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Helper: Smart Draw (Supports Fit/Fill)
  const drawImageSmart = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      if (imageFit === 'COVER') {
          // Fill the box (might cut off)
          const scale = Math.max(w / img.width, h / img.height);
          const nw = img.width * scale;
          const nh = img.height * scale;
          const nx = x + (w - nw) / 2;
          const ny = y + (h - nh) / 2;
          ctx.drawImage(img, nx, ny, nw, nh);
      } else {
          // CONTAIN (Fit Full Image)
          // 1. Blurred Background
          const scaleCover = Math.max(w / img.width, h / img.height);
          const nwCover = img.width * scaleCover;
          const nhCover = img.height * scaleCover;
          const nxCover = x + (w - nwCover) / 2;
          const nyCover = y + (h - nhCover) / 2;
          
          ctx.filter = 'blur(20px) brightness(0.6)';
          ctx.drawImage(img, nxCover, nyCover, nwCover, nhCover);
          ctx.filter = 'none';

          // 2. Main Image
          const scale = Math.min(w / img.width, h / img.height);
          const nw = img.width * scale;
          const nh = img.height * scale;
          const nx = x + (w - nw) / 2;
          const ny = y + (h - nh) / 2;
          
          // Shadow for pop
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 20;
          ctx.drawImage(img, nx, ny, nw, nh);
      }
      ctx.restore();
  }

  // --- Canvas Drawing ---
  const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set Resolution (HD Portrait)
      canvas.width = 1080;
      canvas.height = 1920;

      const w = canvas.width;
      const h = canvas.height;
      const theme = currentTheme;

      // Calculate Layout (Increased from 0.55 to 0.60 to give more space to images)
      let drawAreaH = layoutMode === 'SPLIT' ? h * 0.60 : h;

      if (images.length > 0) {
          // 1. Prepare Images (Use Cache)
          const loadedImages: HTMLImageElement[] = [];
          let allImagesReady = true;

          images.forEach(src => {
              let img = imageCache.current.get(src);
              if (!img) {
                  img = new Image();
                  img.src = src;
                  imageCache.current.set(src, img);
              }
              if (!img.complete) {
                  allImagesReady = false;
                  // Once loaded, re-trigger draw
                  img.onload = () => drawCanvas(); 
              }
              loadedImages.push(img);
          });

          // If images are not ready, don't draw (avoids blank flicker)
          if (!allImagesReady) {
              return; 
          }

          // 2. Clear & Background (Only after we confirm images are ready)
          ctx.fillStyle = theme.bg;
          ctx.fillRect(0, 0, w, h);

          // 3. Draw Collage Synchronously
          const count = loadedImages.length;
          loadedImages.forEach((img, index) => {
              // GRID LOGIC
              let dx = 0, dy = 0, dw = w, dh = drawAreaH;

              if (count === 1) {
                  // Full
                  dx = 0; dy = 0; dw = w; dh = drawAreaH;
              } else if (count === 2) {
                  // 2 Images: Respect Grid Type Preference
                  if (gridType === 'COLS') {
                      // Vertical Split (Left / Right) - Good for Phones
                      dw = w / 2;
                      dh = drawAreaH;
                      dx = (index % 2) * dw;
                      dy = 0;
                  } else {
                      // Horizontal Split (Top / Bottom) - Good for Landscape Spares
                      dw = w;
                      dh = drawAreaH / 2;
                      dx = 0;
                      dy = (index % 2) * dh;
                  }
              } else if (count === 3) {
                  // 1 Big Left, 2 Small Right
                  if (index === 0) {
                      dw = w / 2; dh = drawAreaH; dx = 0; dy = 0;
                  } else {
                      dw = w / 2; dh = drawAreaH / 2;
                      dx = w / 2;
                      dy = (index === 1) ? 0 : dh;
                  }
              } else if (count >= 4) {
                  // 2x2 Grid
                  dw = w / 2;
                  dh = drawAreaH / 2;
                  dx = (index % 2) * dw;
                  dy = (index < 2) ? 0 : dh;
              }

              // Draw Image
              drawImageSmart(ctx, img, dx, dy, dw, dh);
              
              // Border
              if (count > 1) {
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 4;
                  ctx.strokeRect(dx, dy, dw, dh);
              }
          });

          // 4. Draw Overlay Text
          drawTextOverlay(ctx, w, h, drawAreaH);

      } else {
          // Placeholder State
          ctx.fillStyle = theme.bg; // Use theme bg even for placeholder
          ctx.fillRect(0, 0, w, h);
          
          // Placeholder Box
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, w, drawAreaH);
          ctx.fillStyle = '#9ca3af';
          ctx.font = 'bold 40px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText("Select Photo(s)", w/2, drawAreaH/2);
          
          drawTextOverlay(ctx, w, h, drawAreaH);
      }
  };

  const drawTextOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, imgHeight: number) => {
      const theme = currentTheme;
      
      // 3. Draw Details Panel Background
      if (layoutMode === 'SPLIT') {
          ctx.fillStyle = theme.bg;
          ctx.fillRect(0, imgHeight, w, h - imgHeight);
          
          // Diagonal Cut Decoration
          ctx.fillStyle = theme.bg;
          ctx.beginPath();
          ctx.moveTo(0, imgHeight);
          ctx.lineTo(w, imgHeight - 60); 
          ctx.lineTo(w, imgHeight);
          ctx.fill();
      } else {
          // Overlay Mode Gradient
          const gradient = ctx.createLinearGradient(0, h/2, 0, h);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.6, 'rgba(0,0,0,0.8)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, h/2, w, h/2);
      }

      // --- APP NAME WATERMARK (TOP RIGHT) ---
      ctx.save();
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'right';
      // Use shadow to ensure visibility on both white/dark backgrounds
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillText("TrustSpares", w - 30, 60);
      ctx.restore();

      // 4. Text Content
      const startY = layoutMode === 'SPLIT' ? imgHeight + 80 : h - 600;
      ctx.textAlign = 'center';

      // PRODUCT NAME
      ctx.fillStyle = layoutMode === 'SPLIT' ? theme.text : '#ffffff';
      ctx.font = 'bold 80px Inter, sans-serif';
      let titleY = startY + 50;
      
      const titleLines = wrapText(ctx, productName || "Product Name", w - 100);
      titleLines.forEach((line) => {
          ctx.fillText(line, w/2, titleY);
          titleY += 90;
      });

      // PRICE TAG
      const priceText = productPrice ? `₹ ${productPrice}` : "";
      if (priceText) {
          ctx.font = '900 110px Inter, sans-serif';
          ctx.fillStyle = theme.accent;
          titleY += 20;
          ctx.fillText(priceText, w/2, titleY);
          titleY += 100;
      }

      // DETAILS
      ctx.font = '500 45px Inter, sans-serif';
      ctx.fillStyle = layoutMode === 'SPLIT' ? theme.text : '#e2e8f0';
      ctx.globalAlpha = 0.9;
      
      const detailLines = (productDetails || "").split('\n');
      let detailY = titleY + 40;
      
      detailLines.forEach((line) => {
          const subLines = wrapText(ctx, line, w - 120);
          subLines.forEach(sl => {
              if (detailY < h - 250) { 
                  ctx.fillText(sl, w/2, detailY);
                  detailY += 60;
              }
          });
      });
      ctx.globalAlpha = 1.0;

      // 5. FOOTER (Shop & Contact)
      const footerY = h - 180;
      
      // Divider Line
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(150, footerY - 50);
      ctx.lineTo(w - 150, footerY - 50);
      ctx.stroke();

      // Shop Name
      ctx.font = 'bold 50px Inter, sans-serif';
      ctx.fillStyle = layoutMode === 'SPLIT' ? theme.text : '#ffffff';
      ctx.fillText(shopName.toUpperCase(), w/2, footerY + 20);

      // Phone Number
      if (mobile) {
          ctx.font = 'bold 45px monospace';
          ctx.fillStyle = theme.accent;
          ctx.fillText(`📞 ${mobile}`, w/2, footerY + 90);
      }
  };

  // Helper: Text Wrapping
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      const words = text.split(' ');
      let lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
          let width = ctx.measureText(currentLine + " " + words[i]).width;
          if (width < maxWidth) {
              currentLine += " " + words[i];
          } else {
              lines.push(currentLine);
              currentLine = words[i];
          }
      }
      lines.push(currentLine);
      return lines;
  };

  useEffect(() => {
      drawCanvas();
  }, [images, productName, productPrice, productDetails, shopName, mobile, currentTheme, layoutMode, imageFit, gridType]);

  const handleShare = async () => {
      if (images.length === 0) return alert("Please select a photo first.");
      setIsGenerating(true);
      
      canvasRef.current?.toBlob(async (blob) => {
          if (!blob) {
              setIsGenerating(false);
              return;
          }
          const file = new File([blob], "trustspares_post.png", { type: "image/png" });
          const shareText = `${productName} - ₹${productPrice}\n${productDetails}\n\nContact: ${shopName} (${mobile})`;
          
          const shareData = {
              files: [file],
              title: 'New Product',
              text: shareText
          };

          if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
              try {
                  await navigator.share(shareData);
              } catch (err: any) {
                  // Ignore user cancellation (AbortError)
                  if (err.name !== 'AbortError') {
                      console.error("Share failed", err);
                      // Only try fallback if it wasn't a cancellation
                      const link = document.createElement('a');
                      link.download = 'trustspares_post.png';
                      link.href = URL.createObjectURL(blob);
                      link.click();
                  }
              }
          } else {
              const link = document.createElement('a');
              link.download = 'trustspares_post.png';
              link.href = URL.createObjectURL(blob);
              link.click();
          }
          setIsGenerating(false);
      }, 'image/png');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
      <SEO title="Pro Post Maker" description="Create professional sales posters for WhatsApp." />
      
      {/* 1. PREVIEW AREA (Sticky Top) */}
      <div className="flex-none bg-slate-900 relative shadow-lg z-10 overflow-hidden" style={{ height: '40vh' }}>
          <div className="absolute top-4 left-4 z-20">
              <button onClick={() => navigate(-1)} className="p-2 bg-black/40 text-white rounded-full backdrop-blur-md">
                  <ArrowLeft size={20} />
              </button>
          </div>
          
          <div className="w-full h-full flex items-center justify-center p-4">
              <canvas 
                ref={canvasRef} 
                className="h-full w-auto object-contain shadow-2xl rounded-lg"
              />
          </div>
      </div>

      {/* 2. CONTROLS AREA (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-white relative">
          
          {/* A. IMAGE SELECTOR STRIP */}
          <div className="px-4 py-4 border-b border-gray-100">
              {imageError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-start gap-2 mb-4">
                      <span>{imageError}</span>
                  </div>
              )}
              <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {images.length === 0 ? "Add Photos (Max 4)" : `${images.length} Photos Selected`}
                  </label>
                  
                  <div className="flex gap-2">
                      {/* GRID TYPE TOGGLE (Only if 2 images) */}
                      {images.length === 2 && (
                          <div className="flex bg-gray-100 rounded-lg p-0.5">
                              <button 
                                onClick={() => setGridType('COLS')}
                                className={`p-1.5 rounded text-[10px] font-bold ${gridType === 'COLS' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                title="Vertical Split"
                              >
                                  <Columns size={12} />
                              </button>
                              <button 
                                onClick={() => setGridType('ROWS')}
                                className={`p-1.5 rounded text-[10px] font-bold ${gridType === 'ROWS' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                title="Horizontal Split"
                              >
                                  <Rows size={12} />
                              </button>
                          </div>
                      )}

                      {/* FIT TOGGLE */}
                      <div className="flex bg-gray-100 rounded-lg p-0.5">
                          <button 
                            onClick={() => setImageFit('CONTAIN')}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${imageFit === 'CONTAIN' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                          >
                              <Minimize2 size={10} /> Fit
                          </button>
                          <button 
                            onClick={() => setImageFit('COVER')}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${imageFit === 'COVER' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                          >
                              <Maximize2 size={10} /> Fill
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="flex gap-3 overflow-x-auto scrollbar-hide items-center">
                  {images.length < 4 && (
                      <>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 active:scale-95 transition bg-gray-50"
                        >
                            <Plus size={20} />
                            <span className="text-[10px] font-bold">Add</span>
                        </button>
                        <button 
                            onClick={() => {
                                sessionStorage.setItem('camera_opened_postmaker', 'true');
                                cameraInputRef.current?.click();
                            }}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 active:scale-95 transition bg-gray-50"
                        >
                            <Camera size={20} />
                            <span className="text-[10px] font-bold">Cam</span>
                        </button>
                      </>
                  )}

                  {images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-blue-600 ring-2 ring-blue-100 transition-all"
                      >
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-600"
                          >
                              <X size={10} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center font-bold">
                              {idx + 1}
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="mt-3 bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-[10px] text-yellow-800 font-medium flex items-start gap-1.5 leading-tight">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5 text-yellow-600"/>
                  <p>If the app logs out when taking a photo, your phone is running out of memory. Try using the <b>Add</b> button instead.</p>
              </div>
          </div>

          {/* B. EDITOR INPUTS */}
          <div className="p-5 space-y-6 pb-12">
              {/* Product Info */}
              <div className="space-y-4">
                  <div className="relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-2 left-2 bg-white px-1">Product Title</label>
                      <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. iPhone 13 Pro Max"
                        className="w-full p-3 rounded-xl border border-gray-200 font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                  </div>

                  <div className="flex gap-4">
                      <div className="relative flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-2 left-2 bg-white px-1">Price (₹)</label>
                          <input 
                            type="number" 
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="0"
                            className="w-full p-3 rounded-xl border border-gray-200 font-black text-xl text-green-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      <div className="relative flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-2 left-2 bg-white px-1">Layout</label>
                          <div className="flex p-1 bg-gray-100 rounded-xl">
                              <button 
                                onClick={() => setLayoutMode('SPLIT')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${layoutMode === 'SPLIT' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                              >
                                  Split
                              </button>
                              <button 
                                onClick={() => setLayoutMode('OVERLAY')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${layoutMode === 'OVERLAY' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                              >
                                  Full
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-2 left-2 bg-white px-1">Details / Features</label>
                      <textarea 
                        rows={3}
                        value={productDetails}
                        onChange={(e) => setProductDetails(e.target.value)}
                        placeholder="Battery 90%, Original Display, No Scratch..."
                        className="w-full p-3 rounded-xl border border-gray-200 font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                  </div>
              </div>

              {/* Shop Info (Auto-filled) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                      <Send size={14} className="text-blue-600"/>
                      <span className="text-xs font-bold text-gray-500 uppercase">Footer Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Shop Name"
                        className="p-2 rounded-lg border border-gray-200 text-xs font-bold bg-white"
                      />
                      <input 
                        type="text" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Mobile No"
                        className="p-2 rounded-lg border border-gray-200 text-xs font-bold bg-white"
                      />
                  </div>
              </div>

              {/* Theme Picker */}
              <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Color Theme</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                      {THEMES.map(t => (
                          <button 
                            key={t.id}
                            onClick={() => setCurrentTheme(t)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 ${currentTheme.id === t.id ? 'border-blue-600 scale-110' : 'border-gray-200'}`}
                            style={{ backgroundColor: t.bg }}
                            title={t.id}
                          >
                              {currentTheme.id === t.id && <div className={`w-3 h-3 rounded-full ${t.text === '#ffffff' ? 'bg-white' : 'bg-black'}`}></div>}
                          </button>
                      ))}
                      
                      {/* CUSTOM COLOR BUTTON */}
                      <button 
                        onClick={() => setCurrentTheme({ id: 'custom', bg: '#ffffff', text: '#000000', accent: '#2563EB' })}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 ${currentTheme.id === 'custom' ? 'border-blue-600 scale-110' : 'border-gray-200'}`}
                        title="Custom Colors"
                      >
                          <Palette size={16} className="text-white" />
                      </button>
                  </div>

                  {/* CUSTOM COLOR PALETTE UI */}
                  {currentTheme.id === 'custom' && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 animate-in slide-in-from-top duration-300">
                          <div className="flex items-center gap-2 mb-3">
                              <Palette size={14} className="text-gray-500"/>
                              <span className="text-xs font-bold text-gray-600">Customize Colors</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Background</label>
                                  <div className="h-10 w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-sm">
                                      <input 
                                        type="color" 
                                        value={currentTheme.bg} 
                                        onChange={(e) => setCurrentTheme({...currentTheme, bg: e.target.value})}
                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 m-0 cursor-pointer" 
                                      />
                                  </div>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Text Color</label>
                                  <div className="h-10 w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-sm">
                                      <input 
                                        type="color" 
                                        value={currentTheme.text} 
                                        onChange={(e) => setCurrentTheme({...currentTheme, text: e.target.value})}
                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 m-0 cursor-pointer" 
                                      />
                                  </div>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Price/Accent</label>
                                  <div className="h-10 w-full rounded-xl overflow-hidden border border-gray-300 relative shadow-sm">
                                      <input 
                                        type="color" 
                                        value={currentTheme.accent} 
                                        onChange={(e) => setCurrentTheme({...currentTheme, accent: e.target.value})}
                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 m-0 cursor-pointer" 
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              {/* ACTION BUTTON (MOVED HERE TO SCROLL WITH CONTENT) */}
              <button 
                onClick={handleShare}
                disabled={isGenerating || images.length === 0}
                className="w-full bg-[#25D366] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale mt-4"
              >
                  {isGenerating ? 'Creating...' : 'Share to WhatsApp'} <Send size={20} />
              </button>
          </div>
      </div>

      {/* Hidden Inputs */}
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => processFiles(e.target.files)} />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => processFiles(e.target.files)} />
    </div>
  );
};

export default PostMaker;
