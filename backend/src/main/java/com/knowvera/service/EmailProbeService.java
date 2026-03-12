package com.knowvera.service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;

import javax.naming.NamingEnumeration;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailProbeService {

    private static final Logger log = LoggerFactory.getLogger(EmailProbeService.class);

    @Value("${app.email-probe.mode:soft}")
    private String mode;

    @Value("${app.email-probe.timeout-ms:3000}")
    private int timeoutMs;

    @Value("${app.email-probe.helo:knowvera.local}")
    private String heloDomain;

    @Value("${app.email-probe.mail-from:no-reply@knowvera.local}")
    private String probeFrom;

    public boolean isStrict() {
        return "strict".equalsIgnoreCase(mode);
    }

    public boolean verifyAddress(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        String[] parts = email.trim().toLowerCase(Locale.ROOT).split("@", 2);
        if (parts.length != 2) {
            return false;
        }

        String domain = parts[1];
        List<String> mxHosts = lookupMxHosts(domain);
        if (mxHosts.isEmpty()) {
            return false;
        }

        for (String host : mxHosts) {
            if (probeHost(host, email)) {
                return true;
            }
        }

        return false;
    }

    private List<String> lookupMxHosts(String domain) {
        List<String> hosts = new ArrayList<>();
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[] { "MX" });
            Attribute attr = attrs.get("MX");
            if (attr == null) {
                return hosts;
            }
            NamingEnumeration<?> e = attr.getAll();
            while (e.hasMore()) {
                String record = String.valueOf(e.next());
                String[] parts = record.split("\\s+");
                if (parts.length == 2) {
                    hosts.add(parts[1].endsWith(".") ? parts[1].substring(0, parts[1].length() - 1) : parts[1]);
                }
            }
        } catch (Exception ex) {
            log.warn("MX lookup failed for domain {}", domain, ex);
        }
        return hosts;
    }

    private boolean probeHost(String host, String email) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, 25), timeoutMs);
            socket.setSoTimeout(timeoutMs);

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                 BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8))) {

                readLine(reader);
                sendLine(writer, "HELO " + heloDomain);
                readLine(reader);
                sendLine(writer, "MAIL FROM:<" + probeFrom + ">");
                readLine(reader);
                sendLine(writer, "RCPT TO:<" + email + ">");
                String response = readLine(reader);
                sendLine(writer, "QUIT");
                return response != null && response.startsWith("250");
            }
        } catch (Exception ex) {
            log.debug("SMTP probe failed for {} via {}", email, host, ex);
            return false;
        }
    }

    private void sendLine(BufferedWriter writer, String line) throws Exception {
        writer.write(line + "\r\n");
        writer.flush();
    }

    private String readLine(BufferedReader reader) throws Exception {
        return reader.readLine();
    }
}
