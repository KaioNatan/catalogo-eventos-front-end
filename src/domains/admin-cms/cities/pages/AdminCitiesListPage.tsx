import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type { ICity } from "@/entities/city/city.types";
import { useAdminCitiesList } from "@/domains/admin-cms/cities/hooks/useAdminCitiesList";
import { adminApiClient } from "@/services/admin-api/client";

export function AdminCitiesListPage(): ReactElement {
  const { items, setItems, isLoading, error: loadError } = useAdminCitiesList();
  const [error, setError] = useState<string>("");

  async function handleDelete(id: number): Promise<void> {
    try {
      setError("");

      await adminApiClient.deleteCity(id);

      setItems((currentItems: ICity[]) =>
        currentItems.filter((item: ICity) => item.id !== id),
      );
    } catch {
      setError("Não foi possível remover a cidade.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Gerencie as cidades exibidas no portal público."
        >
          Cidades
        </SectionHeader>

        <Link to="/admin/cidades/nova">
          <Button variant="primary">Nova cidade</Button>
        </Link>
      </div>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">
            {error || loadError}
          </p>
        </Card>
      ) : null}

      <Card>
        {isLoading ? (
          <p className="text-sm text-zinc-600">Carregando dados...</p>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma cidade cadastrada.</p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Nome</th>
                  <th className="py-3">Slug</th>
                  <th className="py-3">UF</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: ICity) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-4">{item.name}</td>
                    <td className="py-4">{item.slug}</td>
                    <td className="py-4">{item.state}</td>
                    <td className="py-4">
                      {item.published ? "Publicado" : "Rascunho"}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/cidades/${item.id}/editar`}>
                          <Button variant="secondary" size="sm">
                            Editar
                          </Button>
                        </Link>

                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => void handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
