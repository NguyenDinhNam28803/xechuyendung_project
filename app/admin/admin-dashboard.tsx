"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Article } from "../data/articles";
import type { Vehicle } from "../data/vehicles";

type AdminVehicle = Vehicle & { id: string; isPublished: boolean };
type AdminArticle = Article & { id: string; isPublished: boolean };
type ContentTab = "vehicles" | "articles";

type VehicleForm = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: string;
  images: string;
  badge: string;
  useCase: string;
  highlights: string;
  knownDetails: string;
  sourceUrl: string;
  isPublished: boolean;
};

type ArticleForm = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  sections: string;
  isPublished: boolean;
};

const emptyVehicle: VehicleForm = {
  slug: "",
  name: "",
  make: "",
  category: "Xe tải",
  description: "",
  artwork: "cargo",
  images: "",
  badge: "Dữ liệu mẫu",
  useCase: "",
  highlights: "",
  knownDetails: "[]",
  sourceUrl: "",
  isPublished: false,
};

const emptyArticle: ArticleForm = {
  slug: "",
  category: "",
  title: "",
  summary: "",
  sections: '[\n  {\n    "heading": "",\n    "paragraphs": [""]\n  }\n]',
  isPublished: false,
};

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [tab, setTab] = useState<ContentTab>("vehicles");
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [selectedId, setSelectedId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void loadContent()
      .then(() => setAuthenticated(true))
      .catch((error: unknown) => {
        if (!(error instanceof AdminApiError) || error.status !== 401) {
          showMessage(errorMessage(error), true);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  function showMessage(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setIsError(error);
  }

  async function loadContent() {
    const [nextVehicles, nextArticles] = await Promise.all([
      apiRequest<AdminVehicle[]>("/vehicles"),
      apiRequest<AdminArticle[]>("/articles"),
    ]);
    setVehicles(nextVehicles);
    setArticles(nextArticles);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    showMessage("");
    try {
      await apiRequest<{ ok: boolean }>("/session/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await loadContent();
      setAuthenticated(true);
      setPassword("");
      showMessage("Đăng nhập thành công.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await apiRequest("/session/logout", { method: "POST" });
    setAuthenticated(false);
    setSelectedId("");
    setPassword("");
    showMessage("Đã đăng xuất.");
  }

  async function handleImportDefaults() {
    if (!window.confirm("Chỉ thêm các xe và bài viết mẫu chưa có. Tiếp tục?")) return;
    setIsSaving(true);
    try {
      const result = await apiRequest<{ vehiclesImported: number; articlesImported: number }>(
        "/import-defaults",
        { method: "POST" },
      );
      await loadContent();
      showMessage(
        `Đã nhập ${result.vehiclesImported} xe và ${result.articlesImported} bài viết mới. Nội dung trùng slug được giữ nguyên.`,
      );
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  function startNew() {
    setSelectedId("");
    setVehicleForm({ ...emptyVehicle });
    setArticleForm({ ...emptyArticle });
    showMessage("");
  }

  function editVehicle(vehicle: AdminVehicle) {
    setTab("vehicles");
    setSelectedId(vehicle.id);
    setVehicleForm({
      slug: vehicle.slug,
      name: vehicle.name,
      make: vehicle.make,
      category: vehicle.category,
      description: vehicle.description,
      artwork: vehicle.artwork,
      images: vehicle.images.join("\n"),
      badge: vehicle.badge,
      useCase: vehicle.useCase,
      highlights: vehicle.highlights.join("\n"),
      knownDetails: JSON.stringify(vehicle.knownDetails, null, 2),
      sourceUrl: vehicle.sourceUrl ?? "",
      isPublished: vehicle.isPublished,
    });
    showMessage("");
  }

  function editArticle(article: AdminArticle) {
    setTab("articles");
    setSelectedId(article.id);
    setArticleForm({
      slug: article.slug,
      category: article.category,
      title: article.title,
      summary: article.summary,
      sections: JSON.stringify(article.sections, null, 2),
      isPublished: article.isPublished,
    });
    showMessage("");
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        slug: vehicleForm.slug,
        name: vehicleForm.name,
        make: vehicleForm.make,
        category: vehicleForm.category,
        description: vehicleForm.description,
        artwork: vehicleForm.artwork,
        images: lines(vehicleForm.images),
        badge: vehicleForm.badge,
        useCase: vehicleForm.useCase,
        highlights: lines(vehicleForm.highlights),
        knownDetails: JSON.parse(vehicleForm.knownDetails) as { label: string; value: string }[],
        sourceUrl: vehicleForm.sourceUrl || null,
        isPublished: vehicleForm.isPublished,
      };
      await apiRequest(
        selectedId ? `/vehicles/${selectedId}` : "/vehicles",
        { method: selectedId ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      await loadContent();
      startNew();
      showMessage("Đã lưu thông tin xe.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...articleForm,
        sections: JSON.parse(articleForm.sections) as Article["sections"],
      };
      await apiRequest(
        selectedId ? `/articles/${selectedId}` : "/articles",
        { method: selectedId ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      await loadContent();
      startNew();
      showMessage("Đã lưu bài viết.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(kind: ContentTab, id: string, name: string) {
    if (!window.confirm(`Xóa "${name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await apiRequest(`/${kind}/${id}`, { method: "DELETE" });
      if (selectedId === id) startNew();
      await loadContent();
      showMessage("Đã xóa nội dung.");
    } catch (error) {
      showMessage(errorMessage(error), true);
    }
  }

  if (checkingSession) {
    return <main className="admin-shell"><p>Đang kiểm tra phiên quản trị...</p></main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <form className="admin-card admin-login" onSubmit={handleLogin}>
          <span className="admin-eyebrow">XE CHUYÊN DỤNG</span>
          <h1>Đăng nhập quản trị</h1>
          <p>Đăng nhập để quản lý danh mục xe và bài viết.</p>
          <label>Tên đăng nhập<input autoComplete="username" onChange={(event) => setUsername(event.target.value)} required value={username} /></label>
          <label>Mật khẩu<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
          <button className="admin-primary-button" disabled={isSaving} type="submit">{isSaving ? "Đang đăng nhập..." : "Đăng nhập"}</button>
          {message && <p className="admin-feedback admin-feedback-error" role="status">{message}</p>}
        </form>
      </main>
    );
  }

  const visibleCount = tab === "vehicles" ? vehicles.length : articles.length;

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><span className="admin-eyebrow">QUẢN TRỊ NỘI DUNG</span><h1>Xe Chuyên Dụng</h1></div>
        <button className="admin-secondary-button" onClick={() => void handleLogout()} type="button">Đăng xuất</button>
      </header>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Loại nội dung">
          <button aria-selected={tab === "vehicles"} onClick={() => { setTab("vehicles"); startNew(); }} role="tab" type="button">Xe ({vehicles.length})</button>
          <button aria-selected={tab === "articles"} onClick={() => { setTab("articles"); startNew(); }} role="tab" type="button">Bài viết ({articles.length})</button>
        </div>
        <div className="admin-toolbar-actions">
          <button className="admin-secondary-button" disabled={isSaving} onClick={() => void handleImportDefaults()} type="button">Nhập nội dung mẫu</button>
          <button className="admin-primary-button" onClick={startNew} type="button">+ Tạo mới</button>
        </div>
      </div>
      {message && <p className={`admin-feedback${isError ? " admin-feedback-error" : ""}`} role="status">{message}</p>}
      <div className="admin-workspace">
        <section className="admin-card admin-editor">
          {tab === "vehicles" ? (
            <form onSubmit={saveVehicle}>
              <h2>{selectedId ? "Chỉnh sửa xe" : "Thêm xe"}</h2>
              <div className="admin-form-grid">
                <label>Slug<input maxLength={120} onChange={(event) => setVehicleForm({ ...vehicleForm, slug: event.target.value })} required value={vehicleForm.slug} /></label>
                <label>Tên xe<input maxLength={160} onChange={(event) => setVehicleForm({ ...vehicleForm, name: event.target.value })} required value={vehicleForm.name} /></label>
                <label>Hãng xe<input onChange={(event) => setVehicleForm({ ...vehicleForm, make: event.target.value })} required value={vehicleForm.make} /></label>
                <label>Danh mục<select onChange={(event) => setVehicleForm({ ...vehicleForm, category: event.target.value })} value={vehicleForm.category}><option>Xe tải</option><option>Xe chữa cháy</option><option>Xe cứu hộ</option><option>Xe bồn / xe môi trường</option></select></label>
                <label>Kiểu minh họa<select onChange={(event) => setVehicleForm({ ...vehicleForm, artwork: event.target.value })} value={vehicleForm.artwork}><option value="cargo">Xe tải</option><option value="fire">Xe chữa cháy</option><option value="rescue">Xe cứu hộ</option></select></label>
                <label>Nhãn<input onChange={(event) => setVehicleForm({ ...vehicleForm, badge: event.target.value })} required value={vehicleForm.badge} /></label>
                <label className="admin-full-width">Mô tả<textarea onChange={(event) => setVehicleForm({ ...vehicleForm, description: event.target.value })} required rows={3} value={vehicleForm.description} /></label>
                <label className="admin-full-width">Ảnh (mỗi dòng một URL HTTPS hoặc đường dẫn nội bộ)<textarea onChange={(event) => setVehicleForm({ ...vehicleForm, images: event.target.value })} rows={3} value={vehicleForm.images} /></label>
                <label className="admin-full-width">Mục đích sử dụng<textarea onChange={(event) => setVehicleForm({ ...vehicleForm, useCase: event.target.value })} required rows={2} value={vehicleForm.useCase} /></label>
                <label className="admin-full-width">Điểm nổi bật (mỗi dòng một ý)<textarea onChange={(event) => setVehicleForm({ ...vehicleForm, highlights: event.target.value })} required rows={3} value={vehicleForm.highlights} /></label>
                <label className="admin-full-width">Thông số (JSON dạng [{`{"label":"Tên","value":"Giá trị"}`}])<textarea className="admin-code-input" onChange={(event) => setVehicleForm({ ...vehicleForm, knownDetails: event.target.value })} required rows={6} value={vehicleForm.knownDetails} /></label>
                <label className="admin-full-width">URL nguồn tham khảo<input onChange={(event) => setVehicleForm({ ...vehicleForm, sourceUrl: event.target.value })} type="url" value={vehicleForm.sourceUrl} /></label>
              </div>
              <label className="admin-publish-toggle"><input checked={vehicleForm.isPublished} onChange={(event) => setVehicleForm({ ...vehicleForm, isPublished: event.target.checked })} type="checkbox" /> Hiển thị công khai</label>
              <div className="admin-form-actions"><button className="admin-primary-button" disabled={isSaving} type="submit">{isSaving ? "Đang lưu..." : "Lưu xe"}</button><button className="admin-secondary-button" onClick={startNew} type="button">Hủy</button></div>
            </form>
          ) : (
            <form onSubmit={saveArticle}>
              <h2>{selectedId ? "Chỉnh sửa bài viết" : "Thêm bài viết"}</h2>
              <div className="admin-form-grid">
                <label>Slug<input maxLength={120} onChange={(event) => setArticleForm({ ...articleForm, slug: event.target.value })} required value={articleForm.slug} /></label>
                <label>Chuyên mục<input onChange={(event) => setArticleForm({ ...articleForm, category: event.target.value })} required value={articleForm.category} /></label>
                <label className="admin-full-width">Tiêu đề<input onChange={(event) => setArticleForm({ ...articleForm, title: event.target.value })} required value={articleForm.title} /></label>
                <label className="admin-full-width">Mô tả ngắn<textarea onChange={(event) => setArticleForm({ ...articleForm, summary: event.target.value })} required rows={3} value={articleForm.summary} /></label>
                <label className="admin-full-width">Nội dung (JSON: mảng các mục heading và paragraphs)<textarea className="admin-code-input" onChange={(event) => setArticleForm({ ...articleForm, sections: event.target.value })} required rows={12} value={articleForm.sections} /></label>
              </div>
              <label className="admin-publish-toggle"><input checked={articleForm.isPublished} onChange={(event) => setArticleForm({ ...articleForm, isPublished: event.target.checked })} type="checkbox" /> Hiển thị công khai</label>
              <div className="admin-form-actions"><button className="admin-primary-button" disabled={isSaving} type="submit">{isSaving ? "Đang lưu..." : "Lưu bài viết"}</button><button className="admin-secondary-button" onClick={startNew} type="button">Hủy</button></div>
            </form>
          )}
        </section>
        <section className="admin-card admin-list">
          <div className="admin-list-heading"><h2>Danh sách</h2><span>{visibleCount} mục</span></div>
          <div className="admin-list-items">
            {tab === "vehicles" ? vehicles.map((vehicle) => (
              <article className="admin-list-item" key={vehicle.id}>
                <div><strong>{vehicle.name}</strong><span>{vehicle.make} · {vehicle.category} · {vehicle.isPublished ? "Đang hiển thị" : "Bản nháp"}</span></div>
                <div className="admin-item-actions"><button onClick={() => editVehicle(vehicle)} type="button">Sửa</button><button onClick={() => void deleteItem("vehicles", vehicle.id, vehicle.name)} type="button">Xóa</button></div>
              </article>
            )) : articles.map((article) => (
              <article className="admin-list-item" key={article.id}>
                <div><strong>{article.title}</strong><span>{article.category} · {article.isPublished ? "Đang hiển thị" : "Bản nháp"}</span></div>
                <div className="admin-item-actions"><button onClick={() => editArticle(article)} type="button">Sửa</button><button onClick={() => void deleteItem("articles", article.id, article.title)} type="button">Xóa</button></div>
              </article>
            ))}
            {visibleCount === 0 && <p className="admin-empty">Chưa có nội dung. Có thể nhập dữ liệu mẫu ban đầu.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

class AdminApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function apiRequest<T = void>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(
    path.startsWith("/session/") ? `/api/admin${path}` : `/api/admin/content${path}`,
    {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    },
  );
  const result: unknown = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    const message = isRecord(result) && typeof result.message === "string"
      ? result.message
      : `Yêu cầu thất bại (${response.status}).`;
    throw new AdminApiError(message, response.status);
  }
  return result as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi khi xử lý yêu cầu.";
}

function lines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
