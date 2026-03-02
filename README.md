# Smart Jump

Smart Jump 是一个轻量 VS Code 扩展，支持 JetBrains 系复制出来的代码位置，实时动态搜索项目文件并一键跳转到对应位置（含行号），让跨模块定位更快。

## 功能

- 支持 Python 点路径快速定位，例如：`app.services.user_service.get_user_by_id:42`
- 支持 `模块[:符号][:行号]` 输入格式
- 输入过程中动态加载匹配结果（最多展示 10 个）
- 回车直接打开文件并跳转到目标行
- 当精确路径不存在时，自动尝试父级模块路径

## 使用方式

1. 在 VS Code 中执行命令：`Smart Jump: Go To Python Symbol`
2. 或使用快捷键：
   - macOS: `Cmd+Alt+J`
   - Windows/Linux: `Ctrl+Alt+J`
3. 输入定位字符串并回车

## 输入示例

- `a.b.c`
- `a.b.c:120`
- `a.b.c:ClassName:120`
- `app.services.user_service.get_user_by_id:42`

## 安装

### 方式一：从 VSIX 安装

1. 执行打包命令：

```bash
pnpm run build
```

2. 在 VS Code 中运行 `Extensions: Install from VSIX...`
3. 选择生成的 `smart-jump-<version>.vsix`

### 方式二：开发模式运行

```bash
pnpm install
pnpm run compile
```

然后在 VS Code 中按 `F5` 启动 Extension Development Host。

## 开发

```bash
# 编译
pnpm run compile

# 测试（单元 + 集成）
pnpm test

# 打包 VSIX
pnpm run build
```

## 版本管理

```bash
# patch +1，例如 0.0.4 -> 0.0.5
pnpm run p

# minor +1，例如 0.0.4 -> 0.1.0
pnpm run pp
```

## 许可证

[MIT](./LICENSE)
