"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { certificationSchema } from "@/lib/schema";
import { PlusCircle, X } from "lucide-react";

export function CertificationsForm({ certifications, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuer: "",
      date: "",
      link: "",
    },
  });

  const handleAdd = handleSubmit((data) => {
    onChange([...certifications, data]);
    reset();
    setIsAdding(false);
  });

  const handleDelete = (index) => {
    const newCerts = certifications.filter((_, i) => i !== index);
    onChange(newCerts);
  };

  return (
    <div className="space-y-4">
      {certifications.map((cert, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{cert.name}</CardTitle>
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => handleDelete(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {cert.issuer && <p className="text-sm text-muted-foreground">Issued by: {cert.issuer}</p>}
            {cert.date && <p className="text-sm text-muted-foreground">Date: {cert.date}</p>}
            {cert.link && (
              <p className="text-sm text-muted-foreground">
                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Link
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Certification Name *"
                {...register("name")}
                error={errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Issuing Organization"
                {...register("issuer")}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="month"
                placeholder="Date"
                {...register("date")}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="Certification Link (URL)"
                {...register("link")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Certification
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
          Add Certification
        </Button>
      )}
    </div>
  );
}

