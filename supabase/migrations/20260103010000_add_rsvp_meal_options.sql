-- Insert or update the `rsvp_meal_options` content key so the RSVP form can load editable meal choices
INSERT INTO public.content (key, value, created_at)
VALUES (
  'rsvp_meal_options',
  $$Beef Tenderloin
Herb-Roasted Chicken
Pan-Seared Salmon
Vegetarian Risotto
Vegan Garden Plate$$,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    created_at = EXCLUDED.created_at;
