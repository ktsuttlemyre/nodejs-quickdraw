import numpy as np
import cairocffi as cairo
from PIL import Image
import matplotlib.pyplot as plt 
import time

def vector_to_raster(vector_images, side=28, line_diameter=16, padding=16, bg_color=(0,0,0), fg_color=(1,1,1)):
    """
    padding and line_diameter are relative to the original 256x256 image.
    """
    original_side = 256.
    
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, side, side)
    ctx = cairo.Context(surface)
    ctx.set_antialias(cairo.ANTIALIAS_BEST)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.set_line_width(line_diameter)

    # scale to match the new size
    # add padding at the edges for the line_diameter
    # and add additional padding to account for antialiasing
    total_padding = padding * 2. + line_diameter
    new_scale = float(side) / float(original_side + total_padding)
    ctx.scale(new_scale, new_scale)
    ctx.translate(total_padding / 2., total_padding / 2.)

    raster_images = []
    for vector_image in vector_images:
        # clear background
        ctx.set_source_rgb(*bg_color)
        ctx.paint()
        bbox = np.hstack(vector_image).max(axis=1)
        offset = ((original_side, original_side) - bbox) / 2.
        offset = offset.reshape(-1,1)
        centered = [stroke + offset for stroke in vector_image]
        # draw strokes, this is the most cpu-intensive part
        ctx.set_source_rgb(*fg_color)        
        for xv, yv in centered:
            ctx.move_to(xv[0], yv[0])
            for x, y in zip(xv, yv):
                ctx.line_to(x, y)
            ctx.stroke()

        data = surface.get_data()
        raster_image = np.copy(np.asarray(data)[::4])
        raster_images.append(raster_image)
    
    return raster_images

    
# test = vector_to_raster([[[[0,22,37,64,255],[218,220,227,228,211]],[[76,95,135,141,150,159,166,180,186,201],[220,138,31,0,63,79,117,150,191,224]],[[94,104,111,119,127,141,143,142,180,191],[212,167,149,80,59,41,30,134,202,232]],[[109,127,137,147,150,162,172,185],[122,120,104,97,99,124,128,128]],[[75,130,158],[162,159,150]]]])
execution = []
for i in range(0, 100000) :
    start_time = time.time()
    vector_to_raster([[[[0,15,61,99,137,143,204,199],[230,195,112,50,0,33,222,221]],[[16,19,46,56,64,66,59,86,90,176,178,173,173,201,197,197],[226,224,226,213,208,218,250,255,212,216,217,225,253,253,238,215]],[[106,106,109],[49,136,198]],[[156,158,148,153],[13,36,110,222]],[[35,57,192],[117,123,130]],[[34,105,197],[149,152,165]],[[32,125,219],[170,179,179]]]])
    execution.append((time.time() - start_time))


print(np.mean(execution)*1e3, 'ms')
# 0.3246214079856873 ms


""" c = np.array(b[0])
print(np.shape(c))
loaded = np.reshape(c, [28, 28])
# img = Image.fromarray(loaded, 'RGB')
# img.save('my.png')
# img.show()

plt.imshow(loaded, cmap='gray')
plt.savefig('test.png')
plt.show() """