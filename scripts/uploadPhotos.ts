import { supabase } from "@/lib/supabaseClient"

export async function uploadPhoto(file: File, userId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${userId}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { data, error } = await supabase.storage
        .from("photos")
        .upload(filePath, file)

    if (error) throw error

    return filePath
}