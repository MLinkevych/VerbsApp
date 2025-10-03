// src/assets/thumbnailMap.ts

const THUMBNAILS_BY_ID: Record<string, any> = {
    // Eat
    eat_1: require('../../assets/Eat/dog_eating.jpg'),
    eat_2: require('../../assets/Eat/cat_eating.jpg'),
    eat_3: require('../../assets/Eat/girl_eating.jpg'),
    eat_4: require('../../assets/Eat/boy_eating.jpg'),
    eat_5: require('../../assets/Eat/oldman_eating.jpg'),
    eat_6: require('../../assets/Eat/woman_eating.jpg'),
    // Drink
    drink_1: require('../../assets/Drink/dog_drinking.jpg'),
    drink_2: require('../../assets/Drink/cat_drinking.jpg'),
    drink_3: require('../../assets/Drink/girl_drinking.jpg'),
    drink_4: require('../../assets/Drink/boy_drinking.jpg'),
    drink_5: require('../../assets/Drink/oldman_drinking.jpg'),
    drink_6: require('../../assets/Drink/woman_drinking.jpg'),
    // Sleep
    sleep_1: require('../../assets/Sleep/dog_sleeping.jpg'),
    sleep_2: require('../../assets/Sleep/cat_sleeping.jpg'),
    sleep_3: require('../../assets/Sleep/girl_sleeping.jpg'),
    sleep_4: require('../../assets/Sleep/boy_sleeping.jpg'),
    sleep_5: require('../../assets/Sleep/oldman_sleeping.jpg'),
    sleep_6: require('../../assets/Sleep/woman_sleeping.jpg'),
    // Open
    open_1: require('../../assets/Open/dog_opening.jpg'),
    open_2: require('../../assets/Open/cat_opening.jpg'),
    open_3: require('../../assets/Open/girl_opening.jpg'),
    open_4: require('../../assets/Open/boy_opening.jpg'),
    open_5: require('../../assets/Open/woman_opening.jpg'),
    // Draw
    draw_1: require('../../assets/Draw/dog_drawing.jpg'),
    draw_2: require('../../assets/Draw/cat_drawing.jpg'),
    draw_3: require('../../assets/Draw/girl_drawing.jpg'),
    draw_4: require('../../assets/Draw/boy_drawing.jpg'),
    draw_5: require('../../assets/Draw/woman_drawing.jpg'),
    // Play
    play_1: require('../../assets/Play/dog_playing.jpg'),
    play_2: require('../../assets/Play/cat_playing.jpg'),
    play_3: require('../../assets/Play/girl_playing.jpg'),
    play_4: require('../../assets/Play/boy_playing.jpg'),
    play_5: require('../../assets/Play/woman_playing.jpg'),
    play_6: require('../../assets/Play/oldman_playing.jpg'),
    // Blow
    blow_1: require('../../assets/Blow/dog_blowing.jpg'),
    blow_2: require('../../assets/Blow/cat_blowing.jpg'),
    blow_3: require('../../assets/Blow/girl_blowing.jpg'),
    blow_4: require('../../assets/Blow/boy_blowing.jpg'),
    blow_5: require('../../assets/Blow/woman_blowing.jpg'),
    blow_6: require('../../assets/Blow/oldman_blowing.jpg'),
    // Clap
    clap_1: require('../../assets/Clap/dog_clapping.jpg'),
    clap_2: require('../../assets/Clap/cat_clapping.jpg'),
    clap_3: require('../../assets/Clap/girl_clapping.jpg'),
    clap_4: require('../../assets/Clap/boy_clapping.jpg'),
    clap_5: require('../../assets/Clap/woman_clapping.jpg'),
    clap_6: require('../../assets/Clap/oldman_clapping.jpg'),
    // Run
    run_1: require('../../assets/Run/dog_running.jpg'),
    run_2: require('../../assets/Run/cat_running.jpg'),
    run_3: require('../../assets/Run/girl_running.jpg'),
    run_4: require('../../assets/Run/boy_running.jpg'),
    run_5: require('../../assets/Run/woman_running.jpg'),
    run_6: require('../../assets/Run/oldman_running.jpg'),
    // Wash
    wash_1: require('../../assets/Wash/dog_washing.jpg'),
    wash_2: require('../../assets/Wash/cat_washing.jpg'),
    wash_3: require('../../assets/Wash/girl_washing.jpg'),
    wash_4: require('../../assets/Wash/boy_washing.jpg'),
    wash_5: require('../../assets/Wash/woman_washing.jpg'),
    wash_6: require('../../assets/Wash/oldman_washing.jpg'),
  };
  
  const LEGACY_BY_FILENAME: Record<string, any> = {
    'Eat/dog_eating.mp4': THUMBNAILS_BY_ID.eat_1,
    // ... (add the rest if you still have old data in storage)
  };
  
  const normalize = (s: string) => s.replace(/\\/g, '/').replace(/^\.?\/*/, '');
  
  export function getThumbnailForVideo(video: { id: string; filename?: string }) {
    if (THUMBNAILS_BY_ID[video.id]) return THUMBNAILS_BY_ID[video.id];
    if (video.filename) {
      const k = normalize(video.filename);
      if (LEGACY_BY_FILENAME[k]) return LEGACY_BY_FILENAME[k];
    }
    console.warn('Missing thumbnail for video', video.id, video.filename);
    return undefined;
  }
  