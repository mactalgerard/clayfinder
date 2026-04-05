export interface Listing {
  name: string
  country: string
  phone: string | null
  email: string | null
  website: string | null
  full_address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  working_hours: string | null
  business_status: string | null
  latitude: number | null
  longitude: number | null
  reviews_count: number | null
  street_view_url: string | null
  is_verified_niche: boolean
  rejection_reason: string | null
  source_file: string
  cleaned_at: string | null
  class_types: string[] | null
  skill_levels: string[] | null
  drop_in_available: boolean | null
  booking_required: boolean | null
  price_range: string | null
  studio_type: string | null
  sells_supplies: boolean | null
  kids_classes: boolean | null
  private_events: boolean | null
  open_studio_access: boolean | null
  firing_services: boolean | null
  byob_events: boolean | null
  date_night: boolean | null
  membership_model: string | null
  description: string | null
  enriched_at: string | null
}
