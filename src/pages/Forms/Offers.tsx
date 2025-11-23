import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/common/Button";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TrashBinIcon, PencilIcon } from "../../icons";

type Offer = {
  id: number;
  name: string | null;
  value: number | null;
  quantity: number | null;
  is_enabled: boolean;
  created_at: string;
};

export default function OffersForm() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingOffer, setAddingOffer] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<number | null>(null);
  const [updatingOfferId, setUpdatingOfferId] = useState<number | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [newOfferName, setNewOfferName] = useState<string>("");
  const [newOfferValue, setNewOfferValue] = useState<string>("");
  const [newOfferQuantity, setNewOfferQuantity] = useState<string>("");
  const [newOfferEnabled, setNewOfferEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("offers")
        .select("id, name, value, quantity, is_enabled, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      showCustomToastError(error?.message || error, "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOfferId(offer.id);
    setNewOfferName(offer.name || "");
    setNewOfferValue(offer.value?.toString() || "");
    setNewOfferQuantity(offer.quantity?.toString() || "");
    setNewOfferEnabled(offer.is_enabled);
  };

  const handleCancelEdit = () => {
    setEditingOfferId(null);
    setNewOfferName("");
    setNewOfferValue("");
    setNewOfferQuantity("");
    setNewOfferEnabled(true);
  };

  const handleAddOffer = async () => {
    if (!newOfferName.trim()) {
      showCustomToastError("Offer name is required", "Validation Error");
      return;
    }

    if (!newOfferValue.trim()) {
      showCustomToastError("Offer value is required", "Validation Error");
      return;
    }

    const numericValue = parseFloat(newOfferValue);
    if (isNaN(numericValue)) {
      showCustomToastError("Offer value must be a number", "Validation Error");
      return;
    }

    const numericQuantity = newOfferQuantity.trim() 
      ? parseFloat(newOfferQuantity) 
      : null;
    if (newOfferQuantity.trim() && isNaN(numericQuantity as number)) {
      showCustomToastError("Offer quantity must be a number", "Validation Error");
      return;
    }

    // Check if offer name already exists (excluding the current offer if editing)
    const nameExists = offers.some(
      (o) =>
        o.id !== editingOfferId &&
        o.name?.toLowerCase() === newOfferName.trim().toLowerCase()
    );
    if (nameExists) {
      showCustomToastError("This offer name already exists", "Validation Error");
      return;
    }

    try {
      setAddingOffer(true);
      
      if (editingOfferId) {
        // Update existing offer
        const { error } = await supabaseClient
          .from("offers")
          .update({
            name: newOfferName.trim(),
            value: numericValue,
            quantity: numericQuantity,
            is_enabled: newOfferEnabled,
          })
          .eq("id", editingOfferId);

        if (error) throw error;
        showCustomToastSuccess("Offer updated successfully");
      } else {
        // Create new offer
        const { error } = await supabaseClient.from("offers").insert({
          name: newOfferName.trim(),
          value: numericValue,
          quantity: numericQuantity,
          is_enabled: newOfferEnabled,
        });

        if (error) throw error;
        showCustomToastSuccess("Offer added successfully");
      }

      handleCancelEdit();
      await fetchOffers(); // Refresh offers list
    } catch (error: any) {
      showCustomToastError(
        error?.message || error,
        editingOfferId ? "Failed to update offer" : "Failed to add offer"
      );
    } finally {
      setAddingOffer(false);
    }
  };

  const handleToggleEnabled = async (id: number, currentEnabled: boolean) => {
    try {
      setUpdatingOfferId(id);
      const { error } = await supabaseClient
        .from("offers")
        .update({ is_enabled: !currentEnabled })
        .eq("id", id);

      if (error) throw error;

      showCustomToastSuccess(
        `Offer ${!currentEnabled ? "enabled" : "disabled"} successfully`
      );
      await fetchOffers(); // Refresh offers list
    } catch (error: any) {
      showCustomToastError(
        error?.message || error,
        "Failed to update offer"
      );
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    try {
      setDeletingOfferId(id);
      const { error } = await supabaseClient.from("offers").delete().eq("id", id);

      if (error) throw error;

      showCustomToastSuccess("Offer deleted successfully");
      await fetchOffers(); // Refresh offers list
    } catch (error: any) {
      showCustomToastError(
        error?.message || error,
        "Failed to delete offer"
      );
    } finally {
      setDeletingOfferId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Offer Form */}
      <ComponentCard 
        title={editingOfferId ? "Edit Offer" : "Add New Offer"} 
        desc={editingOfferId ? "Update the offer details" : "Create a new offer (e.g., Buy 1 Get 1 Free)"}
      >
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="new-offer-name">Name</Label>
              <Input
                type="text"
                id="new-offer-name"
                placeholder="e.g., Buy 1 Get 1 Free"
                value={newOfferName}
                onChange={(e) => setNewOfferName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddOffer();
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="new-offer-value">Value</Label>
              <Input
                type="number"
                id="new-offer-value"
                placeholder="e.g., 1"
                value={newOfferValue}
                onChange={(e) => setNewOfferValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddOffer();
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="new-offer-quantity">Quantity</Label>
              <Input
                type="number"
                id="new-offer-quantity"
                placeholder="e.g., 10"
                value={newOfferQuantity}
                onChange={(e) => setNewOfferQuantity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddOffer();
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="new-offer-enabled"
                checked={newOfferEnabled}
                onChange={(e) => setNewOfferEnabled(e.target.checked)}
                className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
              />
              <Label htmlFor="new-offer-enabled" className="mb-0 cursor-pointer">
                Enable
              </Label>
            </div>
            <div className="flex gap-2">
              {editingOfferId && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={addingOffer}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddOffer}
                loading={addingOffer}
                disabled={addingOffer || !newOfferName.trim() || !newOfferValue.trim()}
              >
                {editingOfferId ? "Update Offer" : "Add Offer"}
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Offers List */}
      <ComponentCard title="Offers" desc="Manage existing offers">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No offers found. Add your first offer above.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-white/[0.05] dark:from-gray-800/50 dark:to-gray-800/70">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Value
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Created At
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-transparent">
                  {offers.map((offer) => (
                    <TableRow
                      key={offer.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200"
                    >
                      <TableCell className="px-5 py-3 text-start">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {offer.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {offer.value ?? "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {offer.quantity ?? "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(offer.id, offer.is_enabled)}
                          disabled={updatingOfferId === offer.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            offer.is_enabled
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          } disabled:opacity-50`}
                        >
                          {updatingOfferId === offer.id ? (
                            <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            offer.is_enabled ? "Enabled" : "Disabled"
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(offer.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditOffer(offer)}
                            disabled={editingOfferId === offer.id || deletingOfferId === offer.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                            aria-label="Edit offer"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOffer(offer.id)}
                            disabled={deletingOfferId === offer.id || editingOfferId === offer.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                            aria-label="Delete offer"
                          >
                            {deletingOfferId === offer.id ? (
                              <span className="inline-block h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <TrashBinIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}

