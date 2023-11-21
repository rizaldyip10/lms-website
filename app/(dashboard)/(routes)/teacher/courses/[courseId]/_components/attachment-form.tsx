"use client"

import * as z from "zod";
import axios from "axios"
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Attachment, Course } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";
import { File, ImageIcon, Loader2, Pencil, PlusCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface AttachmentFormProps {
    initialData: Course & { attachment: Attachment[]};
    courseId: string
}

const formSchema = z.object({
    url: z.string().min(1)
})
export const AttachmentForm = ({
    initialData,
    courseId
}: AttachmentFormProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const toggleEdit = () => setIsEditing((current) => !current)
    const router = useRouter()

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values)
            toast.success("Course updated")
            toggleEdit()
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id)
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`)
            toast.success("Attachment deleted")
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-semibold flex items-center justify-between">
                Course attachment
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && (
                    <>Cancel</>
                    )}
                    {!isEditing && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a file
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <>
                    {initialData.attachment.length === 0 && (
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No attachment yet
                        </p>
                    )}
                    {initialData.attachment.length > 0 && (
                        <div className="space-y-2">
                            {initialData.attachment.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200 text-sky-700 rounded-md"
                                >
                                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <p className="text-xs line-clamp-1">
                                        {item.name}
                                    </p>
                                    {deletingId === item.id && (
                                        <div>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    )}
                                    {deletingId !== item.id && (
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="ml-auto hover:opacity-75 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )} 
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ url: url })
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        Add anything your students might need to complete your course
                    </div>
                </div>
            )}
        </div>
    )
}