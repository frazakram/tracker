"use client"

import React, { useState } from "react"
import EmojiPickerReact, { Theme, EmojiClickData } from "emoji-picker-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/Button"
import { Smile } from "lucide-react"

interface EmojiPickerProps {
  currentEmoji?: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ currentEmoji, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
        >
          {currentEmoji ? (
            <span className="text-lg">{currentEmoji}</span>
          ) : (
            <Smile className="h-4 w-4 text-white/50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl" align="start">
        <EmojiPickerReact
          theme={Theme.AUTO}
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
          searchDisabled={false}
          skinTonesDisabled={true}
          previewConfig={{
            showPreview: false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
