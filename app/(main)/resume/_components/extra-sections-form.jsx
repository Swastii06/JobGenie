"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { extraSectionSchema } from "@/lib/schema";
import { PlusCircle, X } from "lucide-react";

export function ExtraSectionsForm({ sections, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(extraSectionSchema),
    defaultValues: {
      title: "",
      items: [""],
    },
  });

  const items = watch("items") || [""];

  const handleAdd = handleSubmit((data) => {
    const filteredItems = data.items.filter((item) => item.trim());
    if (filteredItems.length === 0) {
      return;
    }
    onChange([...sections, { ...data, items: filteredItems }]);
    reset({ title: "", items: [""] });
    setIsAdding(false);
  });

  const handleEdit = (index) => {
    const section = sections[index];
    setValue("title", section.title);
    setValue("items", section.items.length > 0 ? section.items : [""]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleUpdate = handleSubmit((data) => {
    const filteredItems = data.items.filter((item) => item.trim());
    if (filteredItems.length === 0) {
      return;
    }
    const newSections = [...sections];
    newSections[editingIndex] = { ...data, items: filteredItems };
    onChange(newSections);
    reset({ title: "", items: [""] });
    setIsAdding(false);
    setEditingIndex(null);
  });

  const handleDelete = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    onChange(newSections);
  };

  const addItemField = () => {
    setValue("items", [...items, ""]);
  };

  const removeItemField = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setValue("items", newItems.length > 0 ? newItems : [""]);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setValue("items", newItems);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleEdit(index)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingIndex !== null ? "Edit Section" : "Add Section"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Section Title *"
                {...register("title")}
                error={errors.title}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Items</label>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    className="h-20"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItemField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addItemField}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({ title: "", items: [""] });
                setIsAdding(false);
                setEditingIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={editingIndex !== null ? handleUpdate : handleAdd}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {editingIndex !== null ? "Update Section" : "Add Section"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}
    </div>
  );
}

